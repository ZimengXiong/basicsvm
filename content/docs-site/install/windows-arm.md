# Install on Windows ARM

Use the ARM VirtualBox package for Windows on ARM hosts.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| Windows on ARM | VirtualBox | `aarch64-linux` |

## Guidance

1. Install VirtualBox for Windows ARM.
2. Use the bASICs `windows-arm` VirtualBox package.
3. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
4. Forward ports `22`, `5901`, and `6080` if you need host access.
5. Boot the VM and log in as `beaver` with password `works`.

## Build target

The release image is generated from an ARM Linux builder:

```bash
scripts/package-vm windows-arm
```
