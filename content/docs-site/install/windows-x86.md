# Install on Windows x86

Use VirtualBox first on x86 Windows hosts.

## Host target

| Host | Recommended VM app | VM architecture |
| --- | --- | --- |
| Windows on Intel or AMD | VirtualBox | `x86_64-linux` |

## Steps

1. Install VirtualBox from <https://www.virtualbox.org/>.
2. Use the bASICs `x86_64` VM image when available.
3. Create or import a Linux VM.
4. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
5. Enable network access. NAT with port forwarding is enough for most workshop use.
6. Boot the VM and log in as `beaver` with password `works`.

## Useful port forwards

| Host port | Guest port | Use |
| --- | --- | --- |
| `2222` | `22` | SSH |
| `5901` | `5901` | VNC |
| `6080` | `6080` | Browser desktop through noVNC |

Open `http://localhost:6080/` after forwarding `6080`.
