# OpenLane Troubleshooting

## Confirm the environment

Inside the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
openlane --version
yosys -V
```

Expected PDK root:

```text
/opt/basics/pdks
```

## Work from a copied project

Do not run the flow from the read-only example directory. Copy the project first:

```bash
cd ~/bASICs/work
cp -R ../examples/sky130-counter debug-counter
cd debug-counter
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```

## Find the failing step

Check the newest run directory:

```bash
ls -lt runs
find runs -path '*/logs/*' -type f | tail
find runs -path '*/reports/*' -type f | tail
```

If no `runs` directory exists, the command likely failed before OpenLane started the flow. Recheck the current directory, `config.yaml`, and `PDK_ROOT`.

