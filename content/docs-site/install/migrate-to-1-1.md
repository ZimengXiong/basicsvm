# Migrate to version 1.1

There are two ways to get the 1.1 tools.

## Download version 1.1

Download and use the current VM. It already includes VSCodium and the Go Board
tools.

[Download version 1.1](/)

## Keep version 1.0 and install the extra tools

Install the tools in your current VM instead.

### Install VSCodium

This installs the editor.

```bash
nix profile install nixpkgs#vscodium \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

A trailing `\` means “continue on the next line.” If typing this on one line, omit each `\`; including them will cause errors.

### Install Go Board tools

This installs Yosys, nextpnr, icepack, iceprog, and USButils for the Nandland
Go Board.

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

A trailing `\` means “continue on the next line.” If typing this on one line, omit each `\`; including them will cause errors.
