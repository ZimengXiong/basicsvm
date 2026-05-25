# Install on Linux x86

Use VirtualBox or QEMU/KVM on x86 Linux hosts. QEMU/KVM is usually the best fit when hardware virtualization is enabled.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| Linux on Intel or AMD | QEMU/KVM or VirtualBox | `x86_64-linux` |

## Steps

1. Install QEMU/KVM or VirtualBox with your distribution package manager.
2. Use the bASICs `x86_64` VM image when available.
3. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
4. Configure port forwards for SSH, VNC, or noVNC if using NAT networking.
5. Boot the VM and log in as `beaver` with password `works`.

## Local rebuild option

On a Linux host with Nix support, you can rebuild the VM from the repository:

```bash
cd basicsvm
scripts/build-vm x86_64
```
