# VM Filesystem Layout

## User-visible layout

```text
/home/beaver
├── bASICs
│   ├── examples
│   │   ├── picorv32a-sky130
│   │   └── sky130-counter
│   ├── templates
│   │   ├── reference-upstream
│   │   └── sky130-rtl2gds
│   └── work
├── Desktop
│   ├── bASICs -> /home/beaver/bASICs
│   └── bASICs-Docs.desktop -> https://basics.alpacawebservices.com
│   └── Go-Board-Simulator.desktop -> https://basics.alpacawebservices.com/go-board-simulator
└── Documents
    └── bASICs -> /home/beaver/bASICs
```

| Path | Owner | Purpose |
| --- | --- | --- |
| `/home/beaver/bASICs` | `beaver` | Main user-facing bASICs directory |
| `/home/beaver/bASICs/examples` | `root` | Read-only copied examples |
| `/home/beaver/bASICs/templates` | `root` | Read-only copied templates |
| `/home/beaver/bASICs/work` | `beaver` | Writable project workspace |
| `/home/beaver/Documents/bASICs` | symlink | Desktop-friendly entrypoint |
| `/home/beaver/Desktop/bASICs` | symlink | Desktop-friendly entrypoint |
| `/home/beaver/Desktop/bASICs-Docs.desktop` | launcher | Opens hosted documentation |
| `/home/beaver/Desktop/Go-Board-Simulator.desktop` | launcher | Opens the Go Board Simulator |

## System layout

| Path | Purpose |
| --- | --- |
| `/opt/basics/examples` | Symlink to packaged examples |
| `/opt/basics/templates` | Symlink to packaged templates |
| `/opt/basics/pdks` | Pinned PDK installation |
| `/etc/basics-release` | VM release metadata |
| `/etc/profile.d/basics.sh` | Shell environment exports |

The VM creates this layout during NixOS activation.
