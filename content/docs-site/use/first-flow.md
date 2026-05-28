# First Flow: SKY130 Counter

This example checks that the VM, OpenLane, and SKY130 PDK are usable.

## Copy the example

```bash
# Move into the writable workspace.
cd ~/bASICs/work

# Copy the read-only reference example into your workspace.
cp -R ../examples/sky130-counter my-sky130-counter

# Work from the copied project, not from the reference example.
cd my-sky130-counter
```

## Run OpenLane

Run OpenLane:

```bash
# Run OpenLane with the VM-provided PDK location.
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```

## What success looks like

A successful flow creates a `runs` directory in your copied project. Each OpenLane run gets its own timestamped folder:

```text
runs/RUN_<date>_<time>/
```

Inside that run folder, OpenLane records the flow steps, logs, temporary files, and final outputs. The exact step list can change between OpenLane versions and designs, but it will look roughly like this:

```bash
# List the runs created for this copied project.
ls runs

# Open one run directory. Your run name will be different.
cd runs/RUN_2026-05-27_16-51-04

# List the flow steps and top-level run files.
ls
```

Example output:

```text
01-verilator-lint
02-checker-linttimingconstructs
03-checker-linterrors
...
56-magic-streamout
57-klayout-streamout
62-magic-drc
63-klayout-drc
68-netgen-lvs
69-checker-lvs
70-checker-setupviolations
71-checker-holdviolations
72-checker-maxslewviolations
73-checker-maxcapviolations
74-misc-reportmanufacturability
error.log
final
flow.log
resolved.json
tmp
warning.log
```

## Check for generated files

The `final` directory is the main place to look after the flow finishes:

```bash
# From the copied project directory, list final output groups.
tree runs/*/final -L 1

# Print the final GDS file produced by the flow.
find runs -path '*/final/gds/*.gds' -print
```

Example `final` directory:

```text
final
├── def
├── gds
├── json_h
├── klayout_gds
├── lef
├── lib
├── mag
├── mag_gds
├── metrics.csv
├── metrics.json
├── nl
├── odb
├── pnl
├── sdc
├── sdf
├── spef
├── spice
└── vh
```

These are common output groups for this example, not a complete list of every file OpenLane can produce. Different designs, settings, or tool versions can add, remove, or rename outputs.

To see the files inside each group, increase the tree depth:

```bash
# Show files one level below each final output group.
tree runs/*/final -L 2
```

Example:

```text
final
├── def
│   └── counter.def
├── gds
│   └── counter.gds
├── lef
│   └── counter.lef
├── mag
│   └── counter.mag
├── mag_gds
│   └── counter.magic.gds
├── metrics.csv
└── metrics.json
```

Open the generated layout with KLayout:

```bash
# Open the final layout in KLayout.
klayout runs/*/final/gds/*.gds
```

If the `runs` directory is missing or no final GDS appears, go to [OpenLane Troubleshooting](../help/openlane.md).

Next: [Find Results](./results.md).
