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
openlane --pdk-root "$PDK_ROOT" config.yaml
```

## What success looks like

A successful run creates a `runs` directory in your copied project. The exact run directory name can vary, but the final layout should appear under a path like:

```text
runs/<run-name>/final/gds/*.gds
```

You should also see reports and logs:

```text
runs/<run-name>/reports
runs/<run-name>/logs
```

## Check for generated files

OpenLane writes run directories inside the copied project:

```bash
# Show the first few directories created under the run folder.
find runs -maxdepth 3 -type d | head

# Print the final GDS file produced by the flow.
find runs -path '*/final/gds/*.gds' -print
```

Open a generated layout with KLayout:

```bash
# Open the final layout in KLayout.
klayout runs/*/final/gds/*.gds
```

If the `runs` directory is missing or no final GDS appears, go to [OpenLane Troubleshooting](../help/openlane.md).

Next: [Find Results](./results.md).
