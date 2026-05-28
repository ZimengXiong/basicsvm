# Build from Source

This section is for people rebuilding the VM from source, validating package contents, or checking that a release can be regenerated.

The repository is a Nix flake. The repo-local scripts use `nix-portable` under `.nix-portable` and keep local build outputs under `out`.

## Prerequisites

| Need | Notes |
| --- | --- |
| Linux builder | Native NixOS or a Linux host that can run the repo scripts |
| Disk space | VM images and PDK closures are large; keep substantial free space |
| CPU/RAM | More cores and memory reduce rebuild time |
| ARM builder | Required for native `aarch64-linux` release builds |

## Build a dev VM

From the repository:

```bash
cd basicsvm
scripts/build-vm x86_64
```

For ARM builders:

```bash
cd basicsvm
scripts/build-vm aarch64
```

Build outputs are linked under:

```text
out/result-vm-x86_64
out/result-vm-aarch64
```

## Run checks

```bash
cd basicsvm
scripts/nix flake check
scripts/verify-source
scripts/verify-fresh
```

`verify-fresh` builds the profile, templates, and PDK packages, then validates tool availability, Python imports, PDK symlinks, and packaged templates.

## NixOS VM definitions

| Attribute | Architecture |
| --- | --- |
| `nixosConfigurations.basics-x86_64` | `x86_64-linux` |
| `nixosConfigurations.basics-aarch64` | `aarch64-linux` |

The VM configuration is in `nixos/basics.nix`.

## Inspect outputs

After a build, inspect symlink targets:

```bash
readlink -f out/result-vm-x86_64
readlink -f out/result-vm-aarch64
```

Use [Release Images](../release/index.md) when you need distributable UTM, VirtualBox, or QEMU artifacts rather than a local dev VM result.

## Release targets

Release packaging uses named host targets:

```bash
scripts/package-vm macos-apple-silicon
scripts/package-vm macos-intel
scripts/package-vm windows-x86
scripts/package-vm windows-arm
scripts/package-vm linux-x86
```

Linux ARM is not a supported student release target.
