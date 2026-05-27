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

The PDK is installed from pinned Volare release assets. Current symlinks are under:

```text
/opt/basics/pdks/volare/sky130/current
```

## OpenLane use

Pass the PDK root explicitly:

```bash
openlane --pdk-root "$PDK_ROOT" config.yaml
```
