# Install on Linux ARM

Use QEMU/KVM for ARM Linux hosts when hardware virtualization is available.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| Linux on ARM64 | QEMU/KVM | `aarch64-linux` |

## Steps

1. Install QEMU and KVM support with your distribution package manager.
2. Use the bASICs `aarch64` VM image when available.
3. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
4. Configure port forwards for SSH, VNC, or noVNC if using NAT networking.
5. Boot the VM and log in as `beaver` with password `works`.

## Local rebuild option

On a Linux ARM host with Nix support, rebuild the VM from the repository:

```bash
cd basicsvm
scripts/build-vm aarch64
```
