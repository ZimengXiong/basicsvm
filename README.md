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
./scripts/verify-source
```

Build outputs and local Nix state live under ignored directories such as `out/`
and `.nix-portable/`.
