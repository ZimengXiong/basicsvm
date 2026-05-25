# bASICs VM

bASICs VM is a zero-setup open silicon desktop environment. It packages upstream EDA tools, pinned SKY130 and GF180MCU PDK data, example projects, and project templates into a Linux VM.

The same static documentation site can be hosted publicly or bundled offline in the VM. The VM workflow uses upstream commands directly. There are no bASICs wrapper commands.

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

1. Install the VM with the page for your host system.
2. Log in as `beaver` with password `works`.
3. Copy an example or template into `~/bASICs/work`.
4. Run OpenLane, Yosys, OpenROAD, KLayout, and other tools directly.

Start with [Getting Started](./getting-started.md).
