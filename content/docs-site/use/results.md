# Find Outputs

OpenLane keeps generated data in the project directory you copied into `~/bASICs/work`.

## Important paths

| Path pattern | Contents |
| --- | --- |
| `runs/*/final/gds/*.gds` | Final layout |
| `runs/*/final/def/*.def` | Final DEF |
| `runs/*/final/verilog/*.v` | Final netlist |
| `runs/*/final/sdc/*.sdc` | Final constraints |
| `runs/*/reports` | Timing, area, DRC, LVS, and flow reports |
| `runs/*/logs` | Tool logs |

## Quick inspection commands

```bash
tree runs | head -80
find runs -path '*/final/gds/*.gds' -print
find runs -path '*/reports/*' -type f | head
```

## Open a layout

```bash
klayout runs/*/final/gds/*.gds
```

## Keep your work separate

Do not edit `~/bASICs/examples` or `~/bASICs/templates`. Copy a project into `~/bASICs/work`, then make changes there.

## Save results outside the VM

For small files, use SSH, a shared folder, or the VM application's file sharing features. For SSH with the default suggested port forward:

```bash
scp -P 2222 beaver@localhost:~/bASICs/work/my-sky130-counter/runs/*/final/gds/*.gds .
```

For large project directories, compress the project first inside the VM:

```bash
cd ~/bASICs/work
tar -czf my-sky130-counter.tar.gz my-sky130-counter
```
