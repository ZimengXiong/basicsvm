# Install on macOS Intel

Use UTM first on Intel Macs. VirtualBox is also a practical fallback for x86 Linux virtual machines.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| Intel Mac | UTM | `x86_64-linux` |

## Steps

1. Install UTM from <https://mac.getutm.app/>.
2. Use the bASICs `x86_64` VM image when available.
3. Create or import a Linux VM.
4. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
5. Configure network port forwards for SSH, VNC, or noVNC if needed.
6. Boot the VM and log in as `beaver` with password `works`.

## Fallback

If UTM is not suitable on your Intel Mac, use VirtualBox with the same `x86_64` image target and resource sizing.
