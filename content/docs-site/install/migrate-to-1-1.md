# Migrate to version 1.1

[Download version 1.1](../index.md)

Or keep version 1.0 and install the extra tools.

## Install VSCodium

```bash
nix profile install nixpkgs#vscodium \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

## Install Go Board tools

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```
