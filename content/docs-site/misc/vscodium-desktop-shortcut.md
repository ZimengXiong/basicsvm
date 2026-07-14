# Add a VSCodium Desktop Shortcut

VSCodium is already installed in the current bASICs VM. Follow these steps if
you want an icon on the desktop instead of opening it from a terminal.

## Create the shortcut

Open a terminal inside the VM and run:

```bash
cat > ~/Desktop/VSCodium.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=VSCodium
Comment=Code editor
Exec=codium %F
Icon=vscodium
Terminal=false
Categories=Development;IDE;TextEditor;
StartupNotify=true
StartupWMClass=VSCodium
EOF

chmod 0755 ~/Desktop/VSCodium.desktop
```

The **VSCodium** icon should now appear on the desktop. Double-click it to open
the editor. If the desktop asks whether you trust the launcher, select
**Mark Executable** or **Launch Anyway**.

## If VSCodium is not installed

Check whether the command is available:

```bash
codium --version
```

If the terminal reports `codium: command not found`, install the supported tool
patch by following [Update an Existing VM](/install/tool-patch). Then create the
shortcut again.

## Remove the shortcut

Delete only the desktop launcher with:

```bash
rm ~/Desktop/VSCodium.desktop
```

This removes the shortcut without uninstalling VSCodium or deleting any of your
projects.
