# Reference

Repository: [ZimengXiong/basicsvm](https://github.com/ZimengXiong/basicsvm/tree/main)

## VM environment

| Item | Value |
| --- | --- |
| User | `beaver` |
| Password | `works` |
| Workspace | `~/bASICs` |
| Editable projects | `~/bASICs/work` |
| PDK root | `$PDK_ROOT` |
| Release metadata | `/etc/basics-release` |

## User paths

```text
/home/beaver
├── bASICs
│   ├── docs -> /opt/basics/docs
│   ├── examples
│   ├── templates
│   └── work
├── Desktop
│   ├── bASICs -> /home/beaver/bASICs
│   └── bASICs-Docs.desktop
└── Documents
    └── bASICs -> /home/beaver/bASICs
```

## Packaged paths

| Path | Purpose |
| --- | --- |
| `/opt/basics/docs` | Offline docs |
| `/opt/basics/examples` | Packaged examples |
| `/opt/basics/templates` | Packaged project templates |
| `/opt/basics/pdks` | Pinned PDK data |
| `/etc/profile.d/basics.sh` | Shell environment setup |

## PDK

```bash
echo "$PDK_ROOT"
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```

Magic SKY130A tech file:

```text
$PDK_ROOT/sky130A/libs.tech/magic/sky130A.tech
```

## Main tools

| Tool | Used for |
| --- | --- |
| OpenLane 2 | RTL-to-GDS flow |
| OpenROAD | floorplanning, placement, routing, timing, reports |
| OpenSTA | static timing analysis |
| Yosys | Verilog synthesis |
| Verilator | linting and simulation |
| Icarus Verilog | Verilog simulation |
| KLayout | GDS viewing |
| Magic | layout viewing, editing, DRC |
| Netgen | LVS |
| Python | scripting and flow support |
| Git, Make, jq, rsync, curl | project utilities |
| Vim, nano, tree | editing and inspection |

Version commands:

```bash
openlane --version
openroad -version
yosys -V
klayout -v
magic --version
```

## Build commands

```bash
scripts/build-vm x86_64
scripts/build-vm aarch64
scripts/package-vm macos-apple-silicon
scripts/package-vm macos-intel
scripts/package-vm windows-x86
scripts/package-vm windows-arm
scripts/package-vm linux-x86
```
