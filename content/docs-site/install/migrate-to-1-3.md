# Migrate to version 1.3

It is not possible to migrate an existing bASICs VM to version 1.3 in place.
Version 1.3 modifies immutable NixOS system files to install the guest integration
for UTM or VirtualBox. Those files cannot be safely changed inside an existing
prebuilt VM.

Install the version 1.3 VM again using the download for your host platform:

- [macOS on Apple Silicon](./mac-apple-silicon.md)
- [macOS on Intel](./mac-intel.md)
- [Windows x86](./windows-x86.md)
- [Windows ARM](./windows-arm.md)
- [Linux x86](./linux-x86.md)
- [Linux ARM](./linux-arm.md)

Copy your project folders from the old VM to the new version 1.3 VM before
deleting the old VM.
