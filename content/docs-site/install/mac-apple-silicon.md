# Install on macOS Apple Silicon

Use UTM first on Apple Silicon Macs. UTM runs Apple Virtualization and QEMU-based virtual machines and is the most direct fit for an `aarch64-linux` bASICs VM image.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| M1, M2, M3, or newer Mac | UTM | `aarch64-linux` |

## Steps

1. Install UTM from <https://mac.getutm.app/>.
2. Use the bASICs `aarch64` VM image when available.
3. Create or import a Linux VM in UTM.
4. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
5. Enable networking with port forwarding if you want host access to services.
6. Boot the VM and log in as `beaver` with password `works`.

## Useful port forwards

| Host port | Guest port | Use |
| --- | --- | --- |
| `2222` | `22` | SSH |
| `5901` | `5901` | VNC |
| `6080` | `6080` | Browser desktop through noVNC |

After forwarding `6080`, open `http://localhost:6080/` on the Mac.
