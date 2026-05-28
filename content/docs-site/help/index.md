# Troubleshooting

Start with the symptom that matches what failed.

| Symptom | Go to |
| --- | --- |
| Wrong download or VM app | [Install Problems](./install.md) |
| VM boots but host access fails | [Networking Problems](./networking.md) |
| OpenLane fails or no GDS appears | [OpenLane Problems](./openlane.md) |

## Collect basic information

Inside the VM:

```bash
cat /etc/basics-release
uname -m
echo "$PDK_ROOT"
openlane --version
yosys -V
```

On the host, note the host OS, CPU family, VM app, selected artifact, RAM, CPU cores, and disk size.
