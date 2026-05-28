# sky130-counter

Minimal OpenLane2 Classic RTL-to-GDS smoke design for bASICs VM.

```bash
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```

`make` runs the same command and checks that final GDS was produced.
