# Tools Inventory

The bASICs VM installs upstream tools and expects users to run them directly.

## Flow and implementation

| Tool | Purpose |
| --- | --- |
| OpenLane 2 | RTL-to-GDS flow |
| OpenROAD | place, route, timing, and physical design |
| OpenSTA | static timing analysis |
| ABC / OpenROAD ABC | logic optimization and mapping |
| Yosys | Verilog synthesis |
| YoWASP Yosys | WebAssembly-packaged Yosys Python tooling |

## Verification and simulation

| Tool | Purpose |
| --- | --- |
| Verilator | Verilog/SystemVerilog simulation and linting |
| Icarus Verilog | Verilog simulation |

## Layout, circuit, and viewing

| Tool | Purpose |
| --- | --- |
| KLayout | layout viewing and scripting |
| Magic VLSI | layout editing and DRC |
| Netgen | LVS |

## Support utilities

| Tool | Purpose |
| --- | --- |
| Python with EDA packages | scripting and flow support |
| Git, Make, jq, rsync, curl | project and shell utilities |
| Vim, nano, tree | editing and inspection |

Check versions in the VM with normal upstream commands:

```bash
openlane --version
openroad -version
yosys -V
klayout -v
```
