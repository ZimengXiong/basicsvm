# Migrating to version 1.1

Version 1.1 comes with VSCodium and the Go Board tools. The easy way to get
them is to download version 1.1 and start fresh.

You can also keep version 1.0 and add both tools to the VM you already have.
You do not need to rebuild or patch anything.

Run these commands in a VM terminal.

```bash
nix profile install nixpkgs#vscodium \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

Open a new terminal when the installs finish. You can now use VSCodium and
build Go Board projects.
