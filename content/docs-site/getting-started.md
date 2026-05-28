# Getting Started

This page is kept for older links. New users should start with [Start Here](./start/index.md).

## Desktop login

When the VM finishes booting, the desktop opens automatically as the `beaver` user. You do not need to type a username or password for normal desktop use.

Use these credentials only when connecting over SSH or signing in from a text terminal:

```text
user: beaver
password: works
```

## Open a terminal

For the work in these docs, open a terminal from the bASICs folder on the desktop: right-click the folder, then choose **Open Terminal Here**.

![Open Terminal Here from the bASICs desktop folder](/images/open-terminal-here.gif)

You can also open a terminal from the dock at the bottom, the application menu in the top-left corner, or the desktop right-click menu.

## Copy before editing

The bundled examples and templates are read-only references. Copy them into `~/bASICs/work` before modifying files:

```bash
cd ~/bASICs/work
cp -R ../examples/sky130-counter my-sky130-counter
cd my-sky130-counter
```

## Run the SKY130 counter example

Run OpenLane:

```bash
openlane --pdk-root "$PDK_ROOT" config.yaml
```

## Inspect outputs

OpenLane writes run directories inside the project you copied into `~/bASICs/work`. Use normal tools to inspect generated artifacts:

```bash
tree runs | head
klayout runs/*/final/gds/*.gds
```
