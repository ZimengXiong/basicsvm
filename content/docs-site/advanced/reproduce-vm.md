# Reproduce the VM

The `basicsvm` repository is a flake-based build. The repo-local scripts use `nix-portable` under `.nix-portable` and keep build outputs under `out`.

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

The flake defines:

| Attribute | Architecture |
| --- | --- |
| `nixosConfigurations.basics-x86_64` | `x86_64-linux` |
| `nixosConfigurations.basics-aarch64` | `aarch64-linux` |

The VM configuration is in `nixos/basics.nix`.

## Package release images

Release packaging uses named host targets:

```bash
scripts/package-vm macos-apple-silicon
scripts/package-vm macos-intel
scripts/package-vm windows-x86
scripts/package-vm windows-arm
scripts/package-vm linux-x86
```

Linux ARM is not a supported student release target.
