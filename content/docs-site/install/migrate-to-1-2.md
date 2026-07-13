# Migrate to version 1.2

There are two ways to get the 1.2 desktop shortcut.

## Download version 1.2

Download and use the current VM. It already includes a **Go Board Simulator**
shortcut on the desktop.

[Download version 1.2](/)

## Keep version 1.1 or earlier and install the shortcut

Open a terminal in the VM and run:

```bash
cat > ~/Desktop/Go-Board-Simulator.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=Go Board Simulator
Exec=firefox https://basics.alpacawebservices.com/go-board-simulator
Icon=applications-engineering
Terminal=false
Categories=Education;Engineering;
EOF
chmod 0755 ~/Desktop/Go-Board-Simulator.desktop
```

Double-click **Go Board Simulator** on the desktop to open it in Firefox. The
simulator runs in the browser; it does not change your existing VM tools.
