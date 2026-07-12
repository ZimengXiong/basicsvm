# Release Notes

Each VM download is a complete, tested system image. Install the newest image when you can. If reinstalling is inconvenient, the [tool patch](../install/tool-patch.md#patch-an-existing-vm) adds the tools introduced by the latest patch to an existing VM.

## Next patch release — unreleased

This patch keeps the same VM platforms and boot setup as the first stable release. It adds these tools to every new VM image:

- **VSCodium**, a graphical code editor.
- **Nandland Go Board tools**: the open-source iCE40 build and programming tools (`nextpnr-ice40`, `icepack`, and `iceprog`).

Already have a VM and do not want to reinstall? [Patch it yourself.](../install/tool-patch.md#patch-an-existing-vm)

## a359d49 — first stable release

The first public stable bASICs VM release: a ready-to-use FPGA and ASIC development environment for the supported macOS, Windows, and Linux host systems.

Already have this VM and do not want to reinstall? [Patch it yourself.](../install/tool-patch.md#patch-an-existing-vm) The patch adds VSCodium and the Go Board tools.
