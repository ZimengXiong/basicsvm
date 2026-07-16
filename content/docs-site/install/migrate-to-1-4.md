# Migrate to version 1.4

It is not possible to migrate an existing bASICs VM to version 1.4 in place.
Version 1.4 modifies immutable NixOS system files for host shared-folder
integration, so install the version 1.4 VM again.

Download the latest image for your supported host platform:

- [Windows x86](./windows-x86.md)
- [Windows ARM](./windows-arm.md)
- [macOS on Apple Silicon](./mac-apple-silicon.md)
- [macOS on Intel](./mac-intel.md)

Linux hosts remain on their version 1.3 platform images.

Copy your project folders from the old VM to the new version 1.4 VM before
removing the old installation.
