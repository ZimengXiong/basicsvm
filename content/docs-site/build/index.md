# Build from Source

Use this when you want to build the VM yourself or cut a new set of release images.

The repo is a Nix flake, but the scripts here do the boring setup for you. They use the repo-local Nix setup and put build output under `out`.

## Philosophy

The point of the build setup is to keep versions pinned and managed through Git.

When we do a full build, these things should come from the same repo revision:

| Thing | What should match |
| --- | --- |
| VM image | Same tool versions as the flake |
| Local Nix shell | Same tool versions as the VM |
| PDK install | Same PDK files used by the VM and local checks |
| Templates | Same example files bundled into the VM |
| Docs | Same commands and paths that the built VM expects |

Nix is used because it gives us a pinned package set. Git is used because it gives us one place to review and update the docs, templates, scripts, package list, and release config. We do not want one person building with one OpenLane version, another person testing docs with a different Yosys version, and the released VM shipping something else.

Release images are still split by CPU architecture. x86 release targets are built from the x86 build. ARM release targets are built from the ARM build. Packaging then wraps those outputs for the host platform: UTM for macOS, VirtualBox where it fits, and a QEMU disk for Linux ARM.

## Prerequisites

You want a real build machine for this. The VM image and PDK outputs are large, and release packaging moves a lot of data around.

| Requirement | What to use |
| --- | --- |
| Builder OS | NixOS or another Linux host for x86; an ARM Linux builder for ARM |
| Free storage | At least 200 GB free on each builder, plus room for Nix caches |
| CPU and memory | At least 12 CPU cores and 32 GB RAM for fast builds; the ARM builder can run smaller with swap |
| Build time | About 6 to 10 minutes per release build |
| Build machines | One of each architecture |

## Get the source

```bash
git clone https://github.com/ZimengXiong/basicsvm.git
cd basicsvm
```

## Build a local VM

For a local x86 VM build:

```bash
scripts/build-vm x86_64
```

On an ARM builder:

```bash
scripts/build-vm aarch64
```

The result links show up under `out`:

```text
out/result-vm-x86_64
out/result-vm-aarch64
```

## Package release images

Package the target you want to publish:

```bash
scripts/package-vm macos-apple-silicon
scripts/package-vm macos-intel
scripts/package-vm windows-x86
scripts/package-vm windows-arm
scripts/package-vm linux-x86
scripts/package-vm linux-arm
```

Linux ARM ships as a QEMU disk image instead of a VirtualBox appliance.

| Target | Architecture | Output | Student host |
| --- | --- | --- | --- |
| `macos-apple-silicon` | `aarch64-linux` | zipped UTM bundle | Apple Silicon Mac |
| `macos-intel` | `x86_64-linux` | zipped UTM bundle | Intel Mac |
| `windows-x86` | `x86_64-linux` | VirtualBox OVA | Windows on Intel or AMD |
| `windows-arm` | `aarch64-linux` | VirtualBox OVA | Windows on ARM |
| `linux-x86` | `x86_64-linux` | VirtualBox OVA | Linux on Intel or AMD |
| `linux-arm` | `aarch64-linux` | QEMU QCOW2 | Linux on ARM |

To build the full release batch:

```bash
scripts/release-all
```

## ARM builder

ARM release targets need an ARM Linux builder. That can be a real ARM Linux machine or a Linux VM running on an ARM host.

Point the release script at that builder with environment variables:

```bash
BASICS_ARM_BUILDER=user@arm-builder BASICS_ARM_LIMA=lima-vm-name scripts/build-release arm
```

`BASICS_ARM_BUILDER` is the SSH target for the ARM host. If that host uses Lima, set `BASICS_ARM_LIMA` to the Lima VM name. If your ARM builder is already a Linux machine, leave the Lima variable out.

The script copies finished ARM artifacts back into local `out/release`. Some ARM hosts cannot run every packaging tool directly, so the scripts do the final wrapping locally when needed.

## Verify the build

Before publishing, run the checks:

```bash
scripts/nix flake check
scripts/verify-source
scripts/verify-fresh
```

`verify-fresh` rebuilds the profile, templates, and PDK packages, then checks the tool installs, Python imports, PDK links, and templates.

After that, boot at least one x86 release and one ARM release. In each VM, run the SKY130 counter flow from [First Flow](../use/first-flow.md).
