# Version 1.1 stable

Version 1.1 is the newest bASICs VM.

It adds VSCodium and the Go Board tools. You can open an editor, build a Go
Board project, and program the board right away.

## Moving from version 1.0

The easy option is to download version 1.1 and use it as a fresh start.
Everything is already there.

You can also keep the VM you have. You do not need to rebuild or patch it just
to add a tool. Install the extras in your own Nix profile instead.

To add VSCodium, run this in a VM terminal.

```bash
nix profile install nixpkgs#vscodium \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

To add the Go Board tools, run this.

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

Open a new terminal when the install finishes.

The [VSCodium guide](./vscodium.md) and the
[Go Board guide](./go-board-tools.md) have the small setup details.
