{ config, lib, modulesPath, pkgs, basics, ... }:

let
  basicsGtkCss = pkgs.writeText "basics-yellow-black-gtk.css" ''
    @define-color theme_fg_color #050505;
    @define-color theme_bg_color #ffd21f;
    @define-color theme_base_color #ffe066;
    @define-color theme_text_color #050505;
    @define-color theme_selected_bg_color #050505;
    @define-color theme_selected_fg_color #ffd21f;
    @define-color accent_color #050505;

    * {
      color: @theme_fg_color;
      border-color: #050505;
      text-shadow: none;
      box-shadow: none;
    }

    window,
    dialog,
    headerbar,
    toolbar,
    statusbar,
    .background {
      background: @theme_bg_color;
      color: @theme_fg_color;
    }

    button,
    entry,
    spinbutton,
    combobox,
    notebook tab {
      background: #ffd84d;
      color: @theme_fg_color;
      border: 1px solid #050505;
      border-radius: 2px;
    }

    button:hover,
    button:checked,
    entry:focus {
      background: #ffe879;
      color: #050505;
      border-color: #050505;
    }

    treeview,
    list,
    textview,
    viewport,
    scrolledwindow,
    iconview {
      background: @theme_base_color;
      color: @theme_text_color;
    }

    menu,
    menuitem,
    popover {
      background: #ffd21f;
      color: #050505;
    }

    menuitem:hover,
    menuitem:selected,
    treeview:selected,
    iconview:selected,
    text selection,
    label:selected {
      background: #ffe879;
      color: #050505;
    }

    .view:selected,
    .view:hover,
    iconview:hover,
    treeview:hover {
      background: #ffe879;
      color: #050505;
    }

    .rubberband,
    rubberband {
      background: rgba(255, 210, 31, 0.28);
      border-color: #050505;
    }

    panel,
    .xfce4-panel {
      background: #ffd21f;
      color: #050505;
    }

    .xfce4-panel button,
    .xfce4-panel menuitem {
      background: transparent;
      color: #050505;
      border-color: transparent;
    }

    .xfce4-panel button:hover,
    .xfce4-panel menuitem:hover {
      background: #ffe879;
      color: #050505;
      border-color: transparent;
    }
  '';

  basicsTerminalRc = pkgs.writeText "basics-xfce4-terminalrc" ''
    [Configuration]
    ColorForeground=#050505
    ColorBackground=#FFD21F
    ColorCursor=#050505
    ColorBold=#050505
    ColorBoldUseDefault=FALSE
    ColorPalette=#050505;#9F1D20;#3C7A1F;#B38600;#1F5A9F;#6C2A8C;#1B6F72;#F7E27A;#2B2B2B;#C73336;#579C2F;#D4A400;#2F74C0;#8B45AA;#2A8E91;#FFF4B0
    FontName=Monospace Bold 11
    MiscAlwaysShowTabs=FALSE
    MiscBell=FALSE
    MiscBordersDefault=TRUE
    MiscCursorBlinks=TRUE
    MiscCursorShape=TERMINAL_CURSOR_SHAPE_BLOCK
    MiscDefaultGeometry=120x34
    MiscInheritGeometry=FALSE
    MiscMenubarDefault=TRUE
    MiscMouseAutohide=FALSE
    MiscToolbarDefault=FALSE
  '';

in
{
  imports = [
    "${modulesPath}/virtualisation/qemu-vm.nix"
  ];

  system.stateVersion = "25.05";
  networking.hostName = "basics";
  time.timeZone = "America/Los_Angeles";

  users.users.beaver = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" "video" ];
    password = "works";
  };

  services.xserver.enable = true;
  services.xserver.desktopManager.xfce.enable = true;
  services.xserver.displayManager.lightdm.enable = true;
  services.xserver.resolutions = [
    {
      x = 1920;
      y = 1080;
    }
  ];
  services.displayManager.autoLogin.enable = true;
  services.displayManager.autoLogin.user = "beaver";
  services.xserver.xkb.layout = "us";

  networking.networkmanager.enable = true;
  networking.firewall.allowedTCPPorts = [ 22 ];
  services.openssh.enable = true;

  environment.systemPackages = basics.basicsTools ++ [
    pkgs.firefox
    pkgs.gtk-engine-murrine
    pkgs.xorg.xrandr
    pkgs.xfce.xfce4-panel
    pkgs.xfce.thunar
    pkgs.xfce.xfce4-terminal
  ] ++ lib.optionals (builtins.hasAttr "papirus-icon-theme" pkgs) [
    pkgs."papirus-icon-theme"
  ] ++ lib.optionals (builtins.hasAttr "greybird" pkgs) [
    pkgs.greybird
  ];


  environment.variables = {
    BASICS_ROOT = "/opt/basics";
    PDK_ROOT = "/opt/basics/pdks";
    BASICS_EXAMPLES = "/home/beaver/bASICs/examples";
    BASICS_TEMPLATES = "/home/beaver/bASICs/templates";
    BASICS_SKY130_OPEN_PDKS = "0fe599b2afb6708d281543108caf8310912f54af";
    BASICS_GF180MCU_OPEN_PDKS = "c6d73a35f524070e85faff4a6a9eef49553ebc2b";
  };

  environment.etc."profile.d/basics.sh".text = ''
    export BASICS_ROOT=/opt/basics
    export PDK_ROOT=/opt/basics/pdks
    export BASICS_EXAMPLES=/home/beaver/bASICs/examples
    export BASICS_TEMPLATES=/home/beaver/bASICs/templates
  '';

  environment.etc."basics-release".text = ''
    BASICS_VERSION=0.1.0
    BASICS_IMAGE=prototype
    BASICS_USER=beaver
    BASICS_PASSWORD=works
  '';

  systemd.tmpfiles.rules = [
    "d /opt/basics 0755 root root -"
    "d /opt/basics/manifests 0755 root root -"
    "d /home/beaver/Desktop 0755 beaver users -"
    "d /home/beaver/Documents 0755 beaver users -"
    "d /home/beaver/Downloads 0755 beaver users -"
    "d /home/beaver/bASICs 0755 beaver users -"
    "d /home/beaver/bASICs/work 0755 beaver users -"
  ];

  system.activationScripts.basicsExamples = {
    deps = [ "users" "groups" ];
    text = ''
    # Managed reference surface:
    #   /opt/basics, ~/bASICs/examples, ~/bASICs/templates, ~/bASICs/docs,
    #   selected desktop/theme files, and the bASICs launcher/docs symlinks
    #   are recreated on every NixOS switch. Student work in ~/bASICs/work,
    #   ~/Documents, and ~/Downloads is preserved.
    mkdir -p /opt/basics \
      /home/beaver/Desktop \
      /home/beaver/Documents \
      /home/beaver/Downloads \
      /home/beaver/bASICs \
      /home/beaver/bASICs/work
    rm -rf /opt/basics/examples /opt/basics/templates /opt/basics/pdks /opt/basics/docs
    ln -sfnT ${basics.basicsExamples}/share/basics/examples /opt/basics/examples
    ln -sfnT ${basics.basicsTemplates}/share/basics/templates /opt/basics/templates
    ln -sfnT ${basics.basicsPdks}/share/basics/pdks /opt/basics/pdks
    ln -sfnT ${basics.basicsDocsSite}/share/basics/docs-site /opt/basics/docs
    chown 0:0 /opt/basics

    rm -rf /home/beaver/bASICs/examples /home/beaver/bASICs/templates
    cp -rT ${basics.basicsExamples}/share/basics/examples /home/beaver/bASICs/examples
    cp -rT ${basics.basicsTemplates}/share/basics/templates /home/beaver/bASICs/templates
    chown -R root:root /home/beaver/bASICs/examples /home/beaver/bASICs/templates
    find /home/beaver/bASICs/examples /home/beaver/bASICs/templates -type d -exec chmod 0755 {} +
    find /home/beaver/bASICs/examples /home/beaver/bASICs/templates -type f -exec chmod 0644 {} +
    find /home/beaver/bASICs/examples /home/beaver/bASICs/templates -type f \( -name Makefile -o -name '*.sh' \) -exec chmod u+rw,go+r {} +
    rm -f \
      /home/beaver/bASICs/docs \
      /home/beaver/Documents/bASICs \
      /home/beaver/Desktop/bASICs \
      /home/beaver/Desktop/bASICs-Docs.desktop
    ln -sfnT /opt/basics/docs /home/beaver/bASICs/docs
    ln -sfnT /home/beaver/bASICs /home/beaver/Documents/bASICs
    ln -sfnT /home/beaver/bASICs /home/beaver/Desktop/bASICs
    cat > /home/beaver/Desktop/bASICs-Docs.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=bASICs Docs
Exec=firefox /opt/basics/docs/index.html
Icon=help-browser
Terminal=false
Categories=Education;Documentation;
EOF
    chmod 0755 /home/beaver/Desktop/bASICs-Docs.desktop

    install -d -m 0755 \
      /home/beaver/.config/gtk-3.0 \
      /home/beaver/.config/gtk-4.0 \
      /home/beaver/.config/xfce4/terminal \
      /home/beaver/.config/xfce4/xfconf/xfce-perchannel-xml \
      /home/beaver/.config/autostart \
      /home/beaver/.local/bin \
      /usr/share/themes/bASICs-YellowFrames
    install -m 0644 ${basicsGtkCss} /home/beaver/.config/gtk-3.0/gtk.css
    install -m 0644 ${basicsGtkCss} /home/beaver/.config/gtk-4.0/gtk.css
    install -m 0644 ${basicsTerminalRc} /home/beaver/.config/xfce4/terminal/terminalrc

    cat > /home/beaver/.config/xfce4/helpers.rc <<'EOF'
TerminalEmulator=xfce4-terminal
EOF

    rm -rf /usr/share/themes/bASICs-YellowFrames/xfwm4
    cp -R ${pkgs.xfce.xfwm4}/share/themes/Default/xfwm4 /usr/share/themes/bASICs-YellowFrames/xfwm4
    find /usr/share/themes/bASICs-YellowFrames/xfwm4 -type f -name '*.xpm' -exec ${pkgs.gnused}/bin/sed -i \
      -e 's/#e6e6e6/#ffd21f/g' \
      -e 's/#dcdcdc/#ffd21f/g' \
      -e 's/#c0c0c0/#050505/g' \
      -e 's/#808080/#050505/g' {} +
    cat > /usr/share/themes/bASICs-YellowFrames/xfwm4/themerc <<'EOF'
active_text_color=#050505
inactive_text_color=#ffd21f
button_offset=0
button_spacing=1
full_width_title=true
title_horizontal_offset=0
title_shadow_active=false
title_shadow_inactive=false
EOF

    cat > /home/beaver/.config/xfce4/xfconf/xfce-perchannel-xml/xsettings.xml <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xsettings" version="1.0">
  <property name="Net" type="empty">
    <property name="ThemeName" type="string" value="Adwaita"/>
    <property name="IconThemeName" type="string" value="Papirus-Dark"/>
  </property>
  <property name="Gtk" type="empty">
    <property name="FontName" type="string" value="Sans 10"/>
    <property name="MonospaceFontName" type="string" value="Monospace 10"/>
    <property name="ToolbarStyle" type="string" value="icons"/>
    <property name="MenuImages" type="bool" value="true"/>
    <property name="ButtonImages" type="bool" value="true"/>
  </property>
</channel>
EOF

    cat > /home/beaver/.config/xfce4/xfconf/xfce-perchannel-xml/xfwm4.xml <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfwm4" version="1.0">
  <property name="general" type="empty">
    <property name="theme" type="string" value="bASICs-YellowFrames"/>
    <property name="title_font" type="string" value="Sans Bold 10"/>
    <property name="button_layout" type="string" value="O|HMC"/>
    <property name="workspace_count" type="int" value="1"/>
  </property>
</channel>
EOF

    cat > /home/beaver/.config/xfce4/xfconf/xfce-perchannel-xml/xfce4-panel.xml <<'EOF'
<?xml version="1.0" encoding="UTF-8"?>
<channel name="xfce4-panel" version="1.0">
  <property name="configver" type="int" value="2"/>
  <property name="panels" type="array">
    <value type="int" value="1"/>
    <value type="int" value="2"/>
    <property name="dark-mode" type="bool" value="false"/>
    <property name="panel-1" type="empty">
      <property name="position" type="string" value="p=6;x=0;y=0"/>
      <property name="length" type="uint" value="100"/>
      <property name="size" type="uint" value="30"/>
      <property name="position-locked" type="bool" value="true"/>
      <property name="plugin-ids" type="array">
        <value type="int" value="1"/>
        <value type="int" value="2"/>
        <value type="int" value="3"/>
        <value type="int" value="6"/>
        <value type="int" value="12"/>
        <value type="int" value="14"/>
      </property>
    </property>
    <property name="panel-2" type="empty">
      <property name="position" type="string" value="p=10;x=0;y=0"/>
      <property name="length" type="uint" value="1"/>
      <property name="size" type="uint" value="48"/>
      <property name="position-locked" type="bool" value="true"/>
      <property name="autohide-behavior" type="uint" value="1"/>
      <property name="plugin-ids" type="array">
        <value type="int" value="15"/>
        <value type="int" value="17"/>
        <value type="int" value="18"/>
        <value type="int" value="19"/>
        <value type="int" value="20"/>
        <value type="int" value="22"/>
      </property>
    </property>
  </property>
  <property name="plugins" type="empty">
    <property name="plugin-1" type="string" value="applicationsmenu"/>
    <property name="plugin-2" type="string" value="tasklist">
      <property name="grouping" type="uint" value="1"/>
    </property>
    <property name="plugin-3" type="string" value="separator">
      <property name="expand" type="bool" value="true"/>
      <property name="style" type="uint" value="0"/>
    </property>
    <property name="plugin-6" type="string" value="systray">
      <property name="square-icons" type="bool" value="true"/>
    </property>
    <property name="plugin-12" type="string" value="clock"/>
    <property name="plugin-14" type="string" value="actions"/>
    <property name="plugin-15" type="string" value="showdesktop"/>
    <property name="plugin-17" type="string" value="launcher">
      <property name="items" type="array">
        <value type="string" value="firefox.desktop"/>
      </property>
    </property>
    <property name="plugin-18" type="string" value="launcher">
      <property name="items" type="array">
        <value type="string" value="xfce4-terminal.desktop"/>
      </property>
    </property>
    <property name="plugin-19" type="string" value="launcher">
      <property name="items" type="array">
        <value type="string" value="thunar.desktop"/>
      </property>
    </property>
    <property name="plugin-20" type="string" value="launcher">
      <property name="items" type="array">
        <value type="string" value="org.klayout.KLayout.desktop"/>
      </property>
    </property>
    <property name="plugin-22" type="string" value="directorymenu"/>
  </property>
</channel>
EOF

    cat > /home/beaver/.local/bin/set-basics-wallpaper <<'EOF'
#!/bin/sh
wallpaper='${basics.basicsAssets}/share/basics/assets/wallpapers/BW-Entrance.png'
if command -v xrandr >/dev/null 2>&1; then
  xrandr --output Virtual-1 --mode 1920x1080 >/dev/null 2>&1 || true
  xrandr --output Virtual-0 --mode 1920x1080 >/dev/null 2>&1 || true
  xrandr -s 1920x1080 >/dev/null 2>&1 || true
fi
for monitor in Virtual-1 Virtual1 VNC-0 default monitor0; do
  xfconf-query -c xfce4-desktop -p "/backdrop/screen0/monitor$monitor/workspace0/last-image" -n -t string -s "$wallpaper" >/dev/null 2>&1 || true
  xfconf-query -c xfce4-desktop -p "/backdrop/screen0/monitor$monitor/workspace0/last-single-image" -n -t string -s "$wallpaper" >/dev/null 2>&1 || true
  xfconf-query -c xfce4-desktop -p "/backdrop/screen0/monitor$monitor/workspace0/image-style" -n -t int -s 5 >/dev/null 2>&1 || true
done
xfconf-query -c xfce4-desktop -p /backdrop/screen0/monitor0/workspace0/color-style -n -t int -s 0 >/dev/null 2>&1 || true
EOF
    chmod 0755 /home/beaver/.local/bin/set-basics-wallpaper

    cat > /home/beaver/.config/autostart/set-basics-wallpaper.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=bASICs wallpaper
Exec=/home/beaver/.local/bin/set-basics-wallpaper
OnlyShowIn=XFCE;
X-GNOME-Autostart-enabled=true
EOF

    cat > /home/beaver/.config/autostart/xfce4-panel.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=XFCE Panel
Exec=xfce4-panel
OnlyShowIn=XFCE;
X-GNOME-Autostart-enabled=true
EOF

    if id -u beaver >/dev/null 2>&1; then
      chown -R beaver:users /home/beaver/Desktop /home/beaver/Documents /home/beaver/Downloads /home/beaver/bASICs /home/beaver/.config /home/beaver/.local
      chown -R root:root /home/beaver/bASICs/examples /home/beaver/bASICs/templates
	      chown -h beaver:users \
	        /home/beaver/bASICs/docs \
	        /home/beaver/Documents/bASICs \
	        /home/beaver/Desktop/bASICs
	      chown beaver:users /home/beaver/Desktop/bASICs-Docs.desktop
	    fi
    '';
  };

  virtualisation.memorySize = 8192;
  virtualisation.cores = 4;
  virtualisation.diskSize = 65536;
  virtualisation.graphics = false;
  virtualisation.forwardPorts = [
    {
      from = "host";
      host.address = "0.0.0.0";
      host.port = 2222;
      guest.port = 22;
    }
  ];
}
