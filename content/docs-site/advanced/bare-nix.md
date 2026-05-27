# Bare Nix Usage

Use the repository scripts when possible. They provide repo-local Nix without installing a system daemon or editing host shell profiles.

## Enter the dev shell

```bash
cd basicsvm
scripts/dev-shell
```

The dev shell exports:

```text
BASICS_ROOT=$PWD/out/basics-root/opt/basics
PDK_ROOT=$BASICS_ROOT/pdks
BASICS_EXAMPLES=$PWD/examples
```

## Build packages

```bash
cd basicsvm
scripts/nix build .#basics-profile -o out/result-profile
scripts/nix build .#basics-templates -o out/result-templates
scripts/nix build .#basics-pdks -o out/result-pdks
```

## Run tools

Inside the dev shell, run upstream tools directly:

```bash
openlane --version
openroad -version
yosys -V
```

For an example flow:

```bash
cd examples/sky130-counter
openlane --pdk-root "$PDK_ROOT" config.yaml
```

The dev shell is useful for source validation and local experimentation. The full VM remains the target environment for workshops.
