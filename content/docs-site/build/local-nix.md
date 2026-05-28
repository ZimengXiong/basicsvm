# Local Nix Usage

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
scripts/nix build .#basics-docs-site -o out/result-docs
```

## Run tools

Inside the dev shell, check tool availability:

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

## When to use this path

Use local Nix when you are:

- validating package definitions,
- checking that tools are present,
- iterating on examples or templates,
- debugging PDK packaging,
- working without booting the full desktop VM.

Use the full VM when you are validating the student experience.
