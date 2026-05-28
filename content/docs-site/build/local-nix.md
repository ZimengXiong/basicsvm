# Local Nix Usage

Local Nix is useful when you want to check packages, tools, examples, or PDK layout without booting the full VM.

## Enter the dev shell

```bash
cd basicsvm
scripts/dev-shell
```

The shell sets the same paths the project expects:

```text
BASICS_ROOT=$PWD/out/basics-root/opt/basics
PDK_ROOT=$BASICS_ROOT/pdks
BASICS_EXAMPLES=$PWD/examples
```

## Build the main outputs

```bash
cd basicsvm
scripts/nix build .#basics-profile -o out/result-profile
scripts/nix build .#basics-templates -o out/result-templates
scripts/nix build .#basics-pdks -o out/result-pdks
scripts/nix build .#basics-docs-site -o out/result-docs
```

## Smoke test the tools

Inside the dev shell:

```bash
openlane --version
openroad -version
yosys -V
```

You can also run the counter example locally:

```bash
cd examples/sky130-counter
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```
