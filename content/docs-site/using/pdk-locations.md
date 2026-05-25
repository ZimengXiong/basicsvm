# PDK Locations

Inside the VM:

```text
PDK_ROOT=/opt/basics/pdks
```

The VM also exposes the same value through `/etc/profile.d/basics.sh`.

## Installed PDK paths

| PDK | Path |
| --- | --- |
| SKY130 A | `/opt/basics/pdks/sky130A` |
| SKY130 B | `/opt/basics/pdks/sky130B` |
| GF180MCU A | `/opt/basics/pdks/gf180mcuA` |
| GF180MCU B | `/opt/basics/pdks/gf180mcuB` |
| GF180MCU C | `/opt/basics/pdks/gf180mcuC` |
| GF180MCU D | `/opt/basics/pdks/gf180mcuD` |

The PDKs are installed from pinned Volare release assets. Current symlinks are under:

```text
/opt/basics/pdks/volare/sky130/current
/opt/basics/pdks/volare/gf180mcu/current
```

## OpenLane use

Pass the PDK root explicitly:

```bash
openlane --pdk-root "$PDK_ROOT" config.yaml
```
