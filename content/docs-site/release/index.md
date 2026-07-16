# Release Notes

Each VM download is a complete, tested system image. Install the newest image when you can. If reinstalling is inconvenient, the [tool patch](../install/tool-patch.md#patch-an-existing-vm) adds the tools introduced by the latest patch to an existing VM.

## Version 1.4 — current stable release

Version 1.4 adds current guest integration to the Windows images and automatic
host shared folders to macOS. UTM shares mount at `/home/beaver/Shared`; Apple
Silicon uses the GPU-supported display, while Intel Mac retains `virtio-vga`.

[Enable folder sharing](../misc/enable-folder-sharing.md)

This release changes immutable NixOS system files. Existing images cannot be
patched safely; [install the version 1.4 image](../install/migrate-to-1-4.md).

## Version 1.3 — legacy

Version 1.3 installs the guest integration appropriate to each supported VM
platform.

- **UTM:** SPICE guest agent for display resizing, clipboard integration, and
  improved pointer behavior.
- **VirtualBox:** VirtualBox Guest Additions for host integration.

Use the [legacy version 1.3 downloads](../install/version-1-3.md), or
[install version 1.4](../install/migrate-to-1-4.md).

## Version 1.2

This patch keeps the same VM platforms and boot setup as the first stable release. It adds a desktop shortcut for the browser-based Go Board Simulator to every new VM image.

- **Go Board Simulator desktop shortcut**: opens the hosted simulator in Firefox.

Already have a VM and do not want to reinstall? [Install the shortcut yourself.](../install/migrate-to-1-2.md)

## a359d49 — first stable release

The first public stable bASICs VM release: a ready-to-use FPGA and ASIC development environment for the supported macOS, Windows, and Linux host systems.

Already have this VM and do not want to reinstall? [Patch it yourself.](../install/tool-patch.md#patch-an-existing-vm) The patch adds VSCodium and the Go Board tools.
