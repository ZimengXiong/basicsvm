# bASICs VM Maintainer Guide

This repository builds and publishes the bASICs teaching VM. A release contains six downloads built from the same NixOS VM definition: Apple Silicon Mac UTM, Intel Mac UTM, Windows ARM VirtualBox OVA, Windows x86 VirtualBox OVA, Linux x86 VirtualBox OVA, and Linux ARM QEMU qcow2.

The repository is the source of truth. VM contents come from Nix plus the checked-in `content/`, `assets/`, `nix/`, and `nixos/` trees. Release scripts may build, convert, package, upload, and update docs, but they should not manually inject files into a finished VM image.

## Current Outputs

`scripts/finalize-release` writes the upload tree to `out/final`.

| Target | Final artifact |
| --- | --- |
| `macos-apple-silicon` | `bASICs-VM-Apple-Silicon.utm.zip` |
| `macos-intel` | `bASICs-VM-Intel-Mac.utm.zip` |
| `windows-arm` | `bASICs-VM-Windows-ARM.ova` |
| `windows-x86` | `basicsvm-x86_64-linux.ova` |
| `linux-x86` | `basicsvm-x86_64-linux.ova` |
| `linux-arm` | `basicsvm-aarch64-linux.qcow2` |

The final upload tree should contain only those target folders, each with one image, `README.txt`, and `SHA256SUMS`, plus the root `VERSION.json`.

## Normal Release

Use the release driver from a clean `main` checkout:

```bash
git pull --ff-only
scripts/release-all
```

That command cleans generated release outputs, preserves caches, builds every target, finalizes `out/final`, uploads the release to Hugging Face, updates docs install links, builds docs, commits the docs link update, and pushes `main`.

On the main workstation, `scripts/release-all` first runs `scripts/setup-release-storage`. That keeps the source checkout on `/` but stores ignored build output at `/mnt/4TB/vms/basicsvm/out` through the repo's `out` symlink. If a different builder needs another large disk, set `BASICS_OUT_ROOT` once before running release commands.

The release version is the short git SHA at the start of the run. Published files go to:

```text
https://huggingface.co/datasets/zimengxiong/basicsvm/tree/main/releases/<version>
```

## Builders

x86 targets build on the main Linux workstation. ARM targets build on `zimengx@osxserver.lan` through the `basics-arm-builder` Lima VM. The ARM builder is small and uses swap, so ARM builds are expected to be slow.

The ARM Lima VM does not allow the privileged user namespace setup needed by the Nix repart image assembly. For `windows-arm`, `scripts/package-vm` therefore builds the reproducible aarch64 qcow image and converts it to a VirtualBox VDI; `scripts/build-release` then wraps the returned VDI into the final `bASICs-VM-Windows-ARM.ova` on the main Linux workstation.

Check the ARM builder with:

```bash
ssh zimengx@osxserver.lan /bin/bash -s <<'EOF'
set -euo pipefail
export PATH="$HOME/.local/bin:/opt/homebrew/bin:/usr/local/bin:$PATH"
limactl shell basics-arm-builder -- bash -lc \
  'cd /home/zimengx.guest/Projects/basicsvm && git pull --ff-only && BASICS_USE_SYSTEM_NIX=1 scripts/nix eval --impure --raw --expr builtins.currentSystem'
EOF
```

The expected output is `aarch64-linux`.

## Manual Build

Use this only when debugging a release target:

```bash
rm -rf out/release out/final out/final-current
mkdir -p out/release
scripts/build-release x86
BASICS_ARM_BUILDER=zimengx@osxserver.lan BASICS_ARM_LIMA=basics-arm-builder scripts/build-release arm
scripts/finalize-release
```

Upload manually with:

```bash
scripts/upload-hf-release --source out/final --version "$(git rev-parse --short HEAD)"
scripts/update-release-links "$(git rev-parse --short HEAD)"
npm --prefix content/docs-site run build
git add content/docs-site
git commit -m "Update docs for release $(git rev-parse --short HEAD)"
git push
```

## Validation

Run these when changing VM contents, packaging scripts, or release docs:

```bash
scripts/nix flake check
scripts/verify-source
scripts/verify-fresh
scripts/verify-adder-doc
npm --prefix content/docs-site run build
```

`scripts/verify-adder-doc` uses the repo-local Nix wrapper, so run it on both an `x86_64-linux` host and an `aarch64-linux` host when changing the adder guide or the EDA toolchain.

After a full release build, boot or import at least one x86 artifact and one ARM artifact. In the VM, run the SKY130 counter flow from the docs and confirm the desktop docs shortcut opens `https://basics.alpacawebservices.com`.

## Disk Discipline

Keep caches. Delete generated release artifacts when starting over.

Safe generated paths to remove:

```text
out/release
out/final
out/final-current
result
result-*
```

Do not delete `.nix-portable`, `/nix`, `out/hf-venv`, or the remote builder's Nix store unless intentionally doing a cold-cache rebuild.

Use `scripts/setup-release-storage` after a fresh checkout on the main workstation. It is noninteractive and moves any existing ignored `out` contents to the external output root.

UTM packaging removes the unzipped `.utm` bundle after creating the zip. Raw images are removed unless `--keep-raw` is explicitly used. If final output contains raw images, unzipped `.utm` bundles, or duplicate disk fallbacks, fix the packaging script rather than editing the upload tree by hand.
