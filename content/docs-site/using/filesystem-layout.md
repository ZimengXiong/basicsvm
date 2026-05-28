# VM Filesystem Layout

## User-visible layout

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
│   └── work
├── Desktop
│   ├── bASICs -> /home/beaver/bASICs
│   └── bASICs-Docs.desktop
└── Documents
    └── bASICs -> /home/beaver/bASICs
```

| Path | Owner | Purpose |
| --- | --- | --- |
| `/home/beaver/bASICs` | `beaver` | Main user-facing bASICs directory |
| `/home/beaver/bASICs/examples` | `root` | Read-only copied examples |
| `/home/beaver/bASICs/templates` | `root` | Read-only copied templates |
| `/home/beaver/bASICs/work` | `beaver` | Writable project workspace |
| `/home/beaver/bASICs/docs` | symlink | Documentation |
| `/home/beaver/Documents/bASICs` | symlink | Desktop-friendly entrypoint |
| `/home/beaver/Desktop/bASICs` | symlink | Desktop-friendly entrypoint |

## System layout

| Path | Purpose |
| --- | --- |
| `/opt/basics/examples` | Symlink to packaged examples |
| `/opt/basics/templates` | Symlink to packaged templates |
| `/opt/basics/pdks` | Pinned PDK installation |
| `/opt/basics/docs` | Packaged documentation |
| `/etc/basics-release` | VM release metadata |
| `/etc/profile.d/basics.sh` | Shell environment exports |

The VM creates this layout during NixOS activation.
