{ config, lib, modulesPath, pkgs, basicsVmRunner ? true, ... }:

let
  smokeGtkCss = pkgs.writeText "basics-smoke-gtk.css" ''
    @define-color theme_fg_color #050505;
    @define-color theme_bg_color #ffd21f;
    @define-color theme_base_color #ffe066;
    @define-color theme_text_color #050505;
    @define-color theme_selected_bg_color #050505;
    @define-color theme_selected_fg_color #ffd21f;

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
      color: #050505;
      border: 1px solid #050505;
      border-radius: 2px;
    }

    button:hover,
    button:checked,
    entry:focus,
    menuitem:hover,
    menuitem:selected,
    treeview:selected,
    iconview:selected,
    text selection,
    label:selected {
      background: #ffe879;
      color: #050505;
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

  xresources = pkgs.writeText "basics-smoke-Xresources" ''
    XTerm*foreground: #050505
    XTerm*background: #FFD21F
    XTerm*cursorColor: #050505
    XTerm*faceName: Monospace
    XTerm*faceSize: 11
  '';
in
{
  imports = lib.optionals basicsVmRunner [
    "${modulesPath}/virtualisation/qemu-vm.nix"
  ];

  system.stateVersion = "25.05";
  networking.hostName = "basics-smoke";
  time.timeZone = "America/Los_Angeles";

  users.users.beaver = {
    isNormalUser = true;
    extraGroups = [ "wheel" "networkmanager" "video" ];
    password = "works";
  };

  services.xserver.enable = true;
  services.xserver.windowManager.jwm.enable = true;
  services.xserver.displayManager.lightdm.enable = true;
  services.displayManager.defaultSession = "none+jwm";
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
  services.openssh.enable = true;
  services.logrotate.checkConfig = false;

  environment.systemPackages = with pkgs; [
    git
    gnumake
    nano
    vim
    tree
    xorg.xrandr
    xterm
  ];

  environment.etc."basics-release".text = ''
    BASICS_VERSION=smoke
    BASICS_IMAGE=smoke
    BASICS_USER=beaver
    BASICS_PASSWORD=works
  '';

  systemd.tmpfiles.rules = [
    "d /home/beaver/Desktop 0755 beaver users -"
    "d /home/beaver/Documents 0755 beaver users -"
    "d /home/beaver/Downloads 0755 beaver users -"
    "d /home/beaver/bASICs 0755 beaver users -"
    "d /home/beaver/bASICs/work 0755 beaver users -"
  ];

  system.activationScripts.basicsSmokeDesktop = {
    deps = [ "users" "groups" ];
    text = ''
      install -d -m 0755 \
        /home/beaver/Desktop \
        /home/beaver/Documents \
        /home/beaver/Downloads \
        /home/beaver/bASICs/work \
        /home/beaver/.config/gtk-3.0 \
        /home/beaver/.config/gtk-4.0

      install -m 0644 ${smokeGtkCss} /home/beaver/.config/gtk-3.0/gtk.css
      install -m 0644 ${smokeGtkCss} /home/beaver/.config/gtk-4.0/gtk.css
      install -m 0644 ${xresources} /home/beaver/.Xresources

      cat > /home/beaver/.jwmrc <<'EOF'
<JWM>
  <RootMenu onroot="12">
    <Program label="Terminal">xterm</Program>
    <Program label="Smoke Test">xterm -hold -e sh -lc 'echo bASICs smoke image booted; echo user: beaver / works; uname -a; systemctl is-system-running --wait || true'</Program>
    <Restart label="Restart JWM"/>
    <Exit label="Log out"/>
  </RootMenu>
  <Tray x="0" y="0" height="30" autohide="off">
    <TrayButton label="bASICs">root:1</TrayButton>
    <TaskList/>
    <Clock format="%H:%M"/>
  </Tray>
  <WindowStyle>
    <Font>Sans Bold 10</Font>
    <Width>2</Width>
    <Height>24</Height>
    <Active><Text>#050505</Text><Title>#FFD21F</Title><Outline>#050505</Outline></Active>
    <Inactive><Text>#FFD21F</Text><Title>#050505</Title><Outline>#050505</Outline></Inactive>
  </WindowStyle>
  <TrayStyle>
    <Font>Sans Bold 10</Font>
    <Background>#FFD21F</Background>
    <Foreground>#050505</Foreground>
  </TrayStyle>
  <ClockStyle>
    <Foreground>#050505</Foreground>
    <Background>#FFD21F</Background>
  </ClockStyle>
  <Desktops width="1" height="1"/>
  <StartupCommand>xsetroot -solid '#FFD21F'</StartupCommand>
  <StartupCommand>xterm -geometry 100x28+80+80 -hold -e sh -lc 'echo bASICs smoke image booted; echo user: beaver / works; uname -a; systemctl is-system-running --wait || true'</StartupCommand>
</JWM>
EOF

      cat > /home/beaver/Desktop/Smoke-Test.desktop <<'EOF'
[Desktop Entry]
Type=Application
Name=bASICs Smoke Test
Exec=xterm -hold -e sh -lc 'echo bASICs smoke image booted; echo user: beaver / works; uname -a; systemctl is-system-running --wait || true'
Icon=utilities-terminal
Terminal=false
Categories=System;
EOF
      chmod 0755 /home/beaver/Desktop/Smoke-Test.desktop
      chown -R beaver:users /home/beaver/.config /home/beaver/Desktop /home/beaver/Documents /home/beaver/Downloads /home/beaver/bASICs
    '';
  };

  virtualisation.vmVariant = {
    virtualisation.memorySize = 2048;
    virtualisation.cores = 2;
    virtualisation.graphics = true;
  };
}
