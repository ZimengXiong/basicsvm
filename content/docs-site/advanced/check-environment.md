# Check the VM Environment

These checks are useful for debugging, release validation, or advanced setup work. They are not needed for normal workshop use.

## Paths

```bash
echo "$PDK_ROOT"
echo "$BASICS_EXAMPLES"
echo "$BASICS_TEMPLATES"
```

Expected values:

```text
PDK_ROOT=/opt/basics/pdks
BASICS_EXAMPLES=/home/beaver/bASICs/examples
BASICS_TEMPLATES=/home/beaver/bASICs/templates
```

## Release and tool checks

```bash
cat /etc/basics-release
uname -m
openlane --version
yosys -V
klayout -v
```

The architecture from `uname -m` should match the image family:

| VM image | `uname -m` |
| --- | --- |
| `x86_64-linux` | `x86_64` |
| `aarch64-linux` | `aarch64` |
