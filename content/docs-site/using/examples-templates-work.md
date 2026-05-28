# Workspace

The VM keeps the course workspace in `~/bASICs`. The `bASICs` folder on the desktop and the `bASICs` folder in Documents both point to this same location.

```text
~/bASICs
├── docs -> /opt/basics/docs
├── examples
│   ├── picorv32a-sky130
│   └── sky130-counter
├── templates
│   ├── reference-upstream
│   └── sky130-rtl2gds
└── work
```

## Work folder

The `work` directory starts empty. It is the only project area meant for files you edit or generated outputs from tools.

Use it as your starting point:

```bash
cd ~/bASICs/work
```

## Examples and templates

The `examples` and `templates` directories are reference material. Do not edit files there, and do not run project flows directly from those folders. Copy a project into `work` first.

Running tools in the reference folders can fail because those directories are not meant to hold generated outputs.

| Path | Purpose | Edit policy |
| --- | --- | --- |
| `~/bASICs/examples` | Complete reference projects | Read-only reference |
| `~/bASICs/templates` | Starter project layouts and support references | Read-only reference |
| `~/bASICs/work` | Your project workspace | Edit and run tools here |

Copy an example or template into `~/bASICs/work` before making changes:

```bash
cd ~/bASICs/work
cp -R ../templates/sky130-rtl2gds my-chip
cd my-chip
```

The repository currently includes:

| Directory | Notes |
| --- | --- |
| `examples/sky130-counter` | SKY130 counter OpenLane example |
| `examples/picorv32a-sky130` | PicoRV32A SKY130 example |
| `templates/sky130-rtl2gds` | SKY130 RTL-to-GDS starter |
| `templates/reference-upstream` | Packaged template and support references |

## PDK

The PDK is configured through `$PDK_ROOT`. Use that environment variable when a tool asks for the PDK location.
