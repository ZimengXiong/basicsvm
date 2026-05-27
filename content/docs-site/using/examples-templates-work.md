# Examples, Templates, and Work Directory

The VM ships with examples and templates in `~/bASICs`.

| Path | Purpose | Edit policy |
| --- | --- | --- |
| `~/bASICs/examples` | Complete reference projects | Read-only reference |
| `~/bASICs/templates` | Starter project layouts and upstream template references | Read-only reference |
| `~/bASICs/work` | Your project workspace | Edit here |

Copy examples or templates into `~/bASICs/work` before making changes:

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
| `templates/reference-upstream` | Packaged upstream template/support references |

Use upstream commands directly from your copied project. There are no bASICs wrappers.
