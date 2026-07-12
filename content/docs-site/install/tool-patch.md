# Update an Existing VM

## Patch an existing VM

Use this only when you already have a bASICs VM and do not want to download and reinstall a newer image. It adds the tools included in the current patch release:

- VSCodium
- Nandland Go Board tools: `nextpnr-ice40`, `icepack`, and `iceprog`

After this release is published, open a terminal inside the VM and run:

```bash
curl -fsSL https://raw.githubusercontent.com/ZimengXiong/basicsvm/main/scripts/install-tool-patch | bash
```

The patch asks for your password through `sudo` so the Go Board USB permission rule can be installed. When it finishes, restart the terminal (or reboot the VM) before using the tools. The standard VM account password is `works`.

## What this changes

This is a supported **tool patch**, not a full operating-system upgrade. It installs the editor and FPGA tooling while leaving your projects and the rest of the VM system in place.

For the complete updated system, download the newest VM image from the platform install page instead.

## Quick checks

Open VSCodium from a terminal:

```bash
codium
```

Check the Go Board toolchain:

```bash
nextpnr-ice40 --version
icepack -h
iceprog -h
```

If you connect a Go Board, attach its USB device to the VM first; then unplug and reconnect the board after the patch has completed.
