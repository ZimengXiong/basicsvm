# First Counter Flow

This is a quick way to check that the VM can turn a small counter into a chip
layout.

<VideoPlayer src="/videos/first-flow-demo.mp4" title="First Flow: Counter demo" />

## Copy the example

```bash
cd ~/bASICs/work

cp -R ../examples/sky130-counter my-sky130-counter

cd my-sky130-counter
```

## Run OpenLane

Run OpenLane.

```bash
# ~/bASICs/work/my-sky130-counter
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```

## What success looks like

When it finishes, your copied project will have a `runs` folder.

```text
my-sky130-counter
├── config.yaml
├── pin_order.cfg
├── runs
└── src
```

Each run gets its own timestamped folder. That is where the layout files live.

```text
runs
└── RUN_2026-05-27_16-51-04
```

## Go into the run folder

Move into the timestamped run folder and list its contents:

```bash
# ~/bASICs/work/my-sky130-counter
cd runs/RUN_2026-05-27_16-51-04
ls
```

> [!NOTE]
> Replace `RUN_2026-05-27_16-51-04` with the folder on your VM.

Look for a folder named `final` inside it. That is where the useful files are.

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

The `final` folder has the main outputs.

```bash
# ~/bASICs/work/my-sky130-counter/runs/RUN_2026-05-27_16-51-04
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
# ~/bASICs/work/my-sky130-counter/runs/RUN_2026-05-27_16-51-04
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
├── metrics.json
└── ...
```

## Open the layout

Open the generated GDS layout with KLayout:

```bash
# ~/bASICs/work/my-sky130-counter/runs/RUN_2026-05-27_16-51-04
klayout final/klayout_gds/counter.klayout.gds
```

Open the Magic layout with the SKY130A tech file:

```bash
# ~/bASICs/work/my-sky130-counter/runs/RUN_2026-05-27_16-51-04
cd final/mag
magic -T "$PDK_ROOT/sky130A/libs.tech/magic/sky130A.tech" counter.mag
```

![Magic layout output](/images/magic-output.png)

If the `runs` directory is missing or no final GDS appears, go to [OpenLane Troubleshooting](../help/openlane.md).
