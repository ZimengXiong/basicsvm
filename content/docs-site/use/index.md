# VM Basics

## Open a terminal

For the work in these docs, open a terminal from the bASICs folder on the desktop: right-click the folder, then choose **Open Terminal Here**.

![Open Terminal Here from the bASICs desktop folder](/images/open-terminal-here.gif)

You can also open a terminal from the dock at the bottom, the application menu in the top-left corner, or the desktop right-click menu.

## Workspace

The `bASICs` folder on the desktop and the `bASICs` folder in Documents both point to the same workspace at `/home/beaver/bASICs`.

```text
/home/beaver
├── bASICs
│   ├── docs -> /opt/basics/docs
│   ├── examples
│   │   ├── picorv32a-sky130
│   │   └── sky130-counter
│   ├── templates
│   │   ├── reference-upstream
│   │   └── sky130-rtl2gds
│   └── work  <-- put your project files here
├── Desktop
│   ├── bASICs -> /home/beaver/bASICs
│   └── bASICs-Docs.desktop
└── Documents
    └── bASICs -> /home/beaver/bASICs
```

## Work folder

Use `~/bASICs/work` for anything you edit. It starts empty and is the only project area meant for your changes.

```bash
cd ~/bASICs/work
```

## Examples and templates

The `examples` and `templates` folders are read-only reference material. Do not edit files there, and do not run project flows directly from those folders. Copy an example or template into `work` first, then run commands from the copied project. Running tools in the reference folders can fail because those directories are not meant to hold generated outputs.

> [!WARNING]
> Running flows directly inside `examples` or `templates` can fail. For example, copy the counter example into `work` before running it:
>
> ```bash
> cd ~/bASICs/work
> cp -R ../examples/sky130-counter my-sky130-counter
> cd my-sky130-counter
> ```

## PDK

The PDK is configured through `$PDK_ROOT`. Use that environment variable when a tool asks for the PDK location.

Start with [First Flow: SKY130 Counter](./first-flow.md).
