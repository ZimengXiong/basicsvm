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

A successful flow creates a `runs` directory in your copied project.

```text
my-sky130-counter
├── config.yaml
├── pin_order.cfg
├── runs
└── src
```

Each run gets its own timestamped folder:

```text
runs
└── RUN_2026-05-27_16-51-04
```

Inside the run folder, you will see flow steps, logs, temporary files, and `final`:

```bash
cd runs/RUN_2026-05-27_16-51-04
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

The `final` directory contains the main outputs:

```bash
tree final -L 1
```

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

To see the files inside those folders:

```bash
tree final -L 2
```

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

This is not an exhaustive list; the exact outputs can vary by design and tool settings.

## Open the layout

Open the generated layout with KLayout:

```bash
# Open the final layout in KLayout.
klayout runs/*/final/gds/*.gds
```

If the `runs` directory is missing or no final GDS appears, go to [OpenLane Troubleshooting](../help/openlane.md).

Next: [Find Results](./results.md).
