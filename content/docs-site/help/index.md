# VM Troubleshooting

## Wrong download

Use the install page that matches your computer:

| Computer | Page |
| --- | --- |
| Mac with Apple Silicon | [macOS Apple Silicon](../install/mac-apple-silicon.md) |
| Mac with Intel | [macOS Intel](../install/mac-intel.md) |
| Windows with Intel or AMD | [Windows x86](../install/windows-x86.md) |
| Windows with ARM | [Windows ARM](../install/windows-arm.md) |
| Linux with Intel or AMD | [Linux x86](../install/linux-x86.md) |

## Not enough storage

Make sure your computer has at least 30 GB of free storage for the VM download and import.

## Virtualization disabled

On Intel or AMD hosts, enable hardware virtualization in BIOS or firmware settings if the VM app reports that virtualization is unavailable.

## Host access

The VM works from its desktop without host networking. SSH, VNC, and noVNC need port forwarding in the VM app.

| Host port | Guest port | Use |
| --- | --- | --- |
| `2222` | `22` | SSH |
| `5901` | `5901` | VNC |
| `6080` | `6080` | Browser desktop |

SSH:

```bash
ssh -p 2222 beaver@localhost
```

Password:

```text
works
```

noVNC:

```text
http://localhost:6080/
```

## Basic information

Inside the VM:

```bash
cat /etc/basics-release
uname -m
echo "$PDK_ROOT"
```
