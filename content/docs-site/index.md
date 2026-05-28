# bASICs VM

bASICs VM is a zero-setup open silicon desktop environment. It packages upstream EDA tools, pinned SKY130 PDK data, example projects, and project templates into a Linux VM.

Use these docs by task:

| Task | Start here |
| --- | --- |
| Install the VM | [Start Here](./start/index.md) |
| Run a design flow | [First Flow](./use/first-flow.md) |
| Build from source | [Build from Source](./build/index.md) |
| Package a release | [Release Images](./release/index.md) |
| Fix a problem | [Troubleshooting](./help/index.md) |

The VM workflow uses upstream commands directly. There are no bASICs wrapper commands.

## Fast facts

| Item | Value |
| --- | --- |
| VM user | `beaver` |
| VM password | `works` |
| PDK root | `/opt/basics/pdks` |
| User examples | `/home/beaver/bASICs/examples` |
| User templates | `/home/beaver/bASICs/templates` |
| User work area | `/home/beaver/bASICs/work` |
| Browser desktop | available when the VM is launched with a host viewer |
| VNC | available when the VM is launched with a host viewer |
| SSH | guest port `22` |

## Recommended path

1. Pick your computer in [Start Here](./start/index.md).
2. Install the VM with the page for your host system.
3. Start the VM; the desktop logs in automatically.
4. Copy an example or template into `~/bASICs/work`.
5. Run OpenLane, Yosys, OpenROAD, KLayout, and other tools directly.

Start with [Start Here](./start/index.md).
