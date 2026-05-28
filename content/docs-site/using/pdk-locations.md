# PDK Locations

The PDK is configured through the `PDK_ROOT` environment variable:

```text
$PDK_ROOT
```

Use `$PDK_ROOT` rather than typing a fixed path. The VM sets it for shell sessions.

## OpenLane use

Pass the PDK root explicitly:

```bash
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```
