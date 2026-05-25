# Getting Started

## Log in

The VM account is:

```text
user: beaver
password: works
```

The desktop auto-login is enabled in the NixOS VM configuration. If you use SSH or a terminal login, use the same account.

## Open a terminal

Use the XFCE terminal from the panel or application menu. The VM exports the important paths for shell sessions:

```bash
echo "$PDK_ROOT"
echo "$BASICS_EXAMPLES"
echo "$BASICS_TEMPLATES"
```

Expected values inside the VM:

```text
PDK_ROOT=/opt/basics/pdks
BASICS_EXAMPLES=/home/beaver/bASICs/examples
BASICS_TEMPLATES=/home/beaver/bASICs/templates
```

## Copy before editing

The bundled examples and templates are read-only references. Copy them into `~/bASICs/work` before modifying files:

```bash
cd ~/bASICs/work
cp -R ../examples/sky130-counter my-sky130-counter
cd my-sky130-counter
```

## Run the SKY130 counter example

Run upstream OpenLane directly:

```bash
openlane --pdk-root "$PDK_ROOT" config.yaml
```

Some examples include a `Makefile` as a local convenience. It runs the same upstream tool flow and is not a bASICs wrapper layer.

## Inspect outputs

OpenLane writes run directories inside the project you copied into `~/bASICs/work`. Use normal tools to inspect generated artifacts:

```bash
tree runs | head
klayout runs/*/final/gds/*.gds
```
