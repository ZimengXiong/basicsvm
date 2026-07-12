# Versions and updates

The current bASICs VM is the first public stable release. It has everything
needed for the class, including the OpenLane flow and the SKY130 tools.

## What is coming next

The next VM release will add VSCodium and the Go Board tools. That means you
will be able to open an editor, build a Go Board project, and program the board
without adding anything yourself.

## Keep the VM you already have

You do not need to reinstall just to get one extra tool. Nix can add it to your
own account without changing the rest of the VM.

To add VSCodium, run this in a VM terminal.

```bash
nix profile install nixpkgs#vscodium \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

To add the Go Board tools, run this instead.

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

Open a new terminal when the install finishes. The rest of the VM stays as it
is.

The [VSCodium guide](./vscodium.md) and the
[Go Board guide](./go-board-tools.md) have the extra steps for each tool.

## Start fresh instead

If you want everything ready from the start, download the newest VM release
when it is available. You do not need to patch an older VM first.

## Release notes

| Release | What it has |
| --- | --- |
| First public stable release | The class VM, OpenLane, SKY130, examples, and the course docs. |
| Next release | VSCodium and the Go Board toolchain built into the VM. |
