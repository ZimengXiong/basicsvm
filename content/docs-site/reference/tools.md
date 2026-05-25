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
| GTKWave | waveform viewing |
| SymbiYosys | formal verification driver |
| Z3, Yices, Boolector, Bitwuzla, CVC5 | SMT solvers |
| GHDL | VHDL simulation support |
| Surelog, UHDM | SystemVerilog frontend infrastructure |

## Layout, circuit, and viewing

| Tool | Purpose |
| --- | --- |
| KLayout | layout viewing and scripting |
| Magic VLSI | layout editing and DRC |
| Netgen | LVS |
| ngspice | circuit simulation |
| Xschem | schematic capture |

## Support utilities

| Tool | Purpose |
| --- | --- |
| Volare | PDK management |
| Ciel | OpenLane-related utility |
| Python with EDA packages | scripting and flow support |
| Git, Make, jq, rsync, curl, pre-commit | project and shell utilities |
| Vim, nano, tree | editing and inspection |
| Graphviz, xdot | graph rendering and viewing |

Check versions in the VM with normal upstream commands:

```bash
openlane --version
openroad -version
yosys -V
klayout -v
volare --version
```
