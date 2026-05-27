# bASICs VM

Standalone monorepo for the bASICs desktop VM.

This repository owns the Nix VM build, packaging helpers, course examples,
templates, docs site source, and VM visual assets. It does not use git
submodules or depend on the previous checkout at build time.

## Layout

- `flake.nix` - root Nix flake for packages, dev shells, and NixOS VM configs.
- `nix/` - package definitions for Python tools, templates, and PDK bundles.
- `nixos/` - VM system configuration.
- `scripts/` - local build, run, view, and validation helpers.
- `content/` - vendored examples, templates, and docs site source.
- `assets/` - vendored images and other VM assets.

## Common Commands

```bash
./scripts/dev-shell
./scripts/build-vm x86_64
./scripts/run-vm x86_64
./scripts/view-vm
./scripts/preview-vm --rebuild
./scripts/verify-source
```

## Release Targets

Use `scripts/package-vm` for release images. The supported student host targets
are:

- `macos-apple-silicon` - aarch64 zipped UTM bundle plus QCOW2
- `macos-intel` - x86_64 zipped UTM bundle plus QCOW2
- `windows-x86` - x86_64 VirtualBox OVA
- `windows-arm` - aarch64 VirtualBox/VDI
- `linux-x86` - x86_64 VirtualBox OVA

Linux ARM is intentionally not a supported student target.

```bash
./scripts/build-release local
./scripts/build-release x86
BASICS_ARM_BUILDER=xzm@xzm.local ./scripts/build-release arm
./scripts/finalize-release
./scripts/upload-hf-release --version "$(git rev-parse --short HEAD)"
./scripts/package-vm macos-apple-silicon
./scripts/package-vm macos-intel
./scripts/package-vm windows-x86
./scripts/package-vm windows-arm
./scripts/package-vm linux-x86
```

For builders where Nix can build the system closure but cannot mount loopback
filesystems inside the Nix sandbox, rerun the same target with the kept repart
build directory:

```bash
sudo ./scripts/package-vm windows-arm --repart-build-dir /nix/var/nix/builds/nix-...
```

Build outputs and local Nix state live under ignored directories such as `out/`
and `.nix-portable/`.
