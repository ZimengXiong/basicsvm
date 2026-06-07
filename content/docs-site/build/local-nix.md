# Local Nix Usage

Use this when you want to poke at the VM environment without booting the VM. It is handy for checking tools, examples, and PDK paths from your normal shell.

## Get the source

```bash
git clone https://github.com/ZimengXiong/basicsvm.git
cd basicsvm
```

## Enter the dev shell

```bash
scripts/dev-shell
```

The shell sets the paths the project expects:

```text
BASICS_ROOT=$PWD/out/basics-root/opt/basics
PDK_ROOT=$BASICS_ROOT/pdks
BASICS_EXAMPLES=$PWD/examples
```

## Build the main outputs

These are the main pieces that end up in the VM:

```bash
scripts/nix build .#basics-profile -o out/result-profile
scripts/nix build .#basics-templates -o out/result-templates
scripts/nix build .#basics-pdks -o out/result-pdks
```

## Test the tools

Inside the dev shell, try a few tools:

```bash
openlane --version
openroad -version
yosys -V
```

You can also run the counter example without starting a VM:

```bash
cd examples/sky130-counter
openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml
```
