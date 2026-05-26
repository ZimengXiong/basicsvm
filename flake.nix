{
  description = "bASICs VM: zero-setup open silicon desktop VM";

  inputs = {
    openlane2.url = "github:efabless/openlane2";
    nixpkgs.follows = "openlane2/nix-eda/nixpkgs";
    nixpkgs-image.url = "github:NixOS/nixpkgs/nixos-25.05";
    nixos-generators.url = "github:nix-community/nixos-generators/1.8.0";
    nixos-generators.inputs.nixpkgs.follows = "nixpkgs";
  };

  outputs = { self, nixpkgs, nixpkgs-image, openlane2, nixos-generators, ... }:
    let
      systems = [ "x86_64-linux" "aarch64-linux" ];
      forAllSystems = nixpkgs.lib.genAttrs systems;
      pkgsFor = system: openlane2.legacyPackages.${system};
      imageDiskSizeMiB = 80 * 1024;
      imageDiskSizeModule = { lib, ... }: {
        virtualisation.diskSize = lib.mkForce imageDiskSizeMiB;
      };
      qcowImageDiskSizeModule = { lib, config, pkgs, modulesPath, ... }: {
        system.build.qcow = lib.mkForce (import "${toString modulesPath}/../lib/make-disk-image.nix" {
          inherit lib config pkgs;
          diskSize = imageDiskSizeMiB;
          format = "qcow2";
          partitionTableType = "hybrid";
          memSize = 4096;
        });
      };
      repartImageModule = { config, lib, pkgs, modulesPath, ... }:
        let
          efiArch = pkgs.stdenv.hostPlatform.efiArch;
        in
        {
          imports = [ "${modulesPath}/image/repart.nix" ];

          fileSystems."/" = {
            device = "/dev/disk/by-label/nixos";
            fsType = "ext4";
          };

          boot.loader.grub.enable = false;
          boot.loader.systemd-boot.enable = lib.mkForce true;
          boot.loader.efi.canTouchEfiVariables = false;
          boot.initrd.includeDefaultModules = false;
          boot.initrd.availableKernelModules = lib.mkForce [
            "ahci"
            "sd_mod"
            "sr_mod"
            "virtio_pci"
            "virtio_blk"
            "virtio_scsi"
            "xhci_pci"
            "usbhid"
          ];

          image.repart = {
            name = "basicsvm-${pkgs.stdenv.hostPlatform.system}";
            compression.enable = true;
            compression.algorithm = "zstd";
            partitions = {
              "10-esp" = {
                contents = {
                  "/EFI/BOOT/BOOT${lib.toUpper efiArch}.EFI".source =
                    "${pkgs.systemd}/lib/systemd/boot/efi/systemd-boot${efiArch}.efi";
                  "/EFI/Linux/${config.system.boot.loader.ukiFile}".source =
                    "${config.system.build.uki}/${config.system.boot.loader.ukiFile}";
                };
                repartConfig = {
                  Type = "esp";
                  Format = "vfat";
                  Label = "ESP";
                  SizeMinBytes = "96M";
                };
              };
              "20-root" = {
                storePaths = [ config.system.build.toplevel ];
                repartConfig = {
                  Type = "root";
                  Format = "ext4";
                  Label = "nixos";
                  SizeMinBytes = "80G";
                  SizeMaxBytes = "80G";
                };
              };
            };
          };
        };
      basicsFor = system:
        let
          pkgs = pkgsFor system;
          yowaspRuntime = pkgs.python3Packages.callPackage ./nix/python-yowasp-runtime.nix { };
          wasmtime = pkgs.python3Packages.callPackage ./nix/python-wasmtime.nix { };
          yowaspYosys = pkgs.python3Packages.callPackage ./nix/python-yowasp-yosys.nix {
            inherit wasmtime yowaspRuntime;
          };
          basicsContent = ./content;
          basicsAssets = pkgs.callPackage ./assets/nix/package.nix { };
          basicsPython = pkgs.python3.withPackages (ps: with ps; [
            cairosvg
            chevron
            configupdater
            gdstk
            gitpython
            (ps.callPackage ./nix/python-klayout.nix { })
            matplotlib
            mistune
            numpy
            platformdirs
            pillow
            pytest
            python-frontmatter
            pyserial
            pyyaml
            requests
            virtualenv
            yowaspYosys
          ]);
          basicsTemplates = pkgs.callPackage ./nix/templates.nix {
            inherit basicsContent;
          };
          basicsExamples = pkgs.stdenvNoCC.mkDerivation {
            pname = "basics-examples";
            version = "0.1.0";
            dontUnpack = true;
            dontBuild = true;
            installPhase = ''
              runHook preInstall
              mkdir -p "$out/share/basics/examples"
              cp -R ${basicsContent}/examples/. "$out/share/basics/examples/"
              find "$out/share/basics/examples" -type d -exec chmod 0755 {} +
              find "$out/share/basics/examples" -type f -exec chmod 0644 {} +
              runHook postInstall
            '';
          };
          basicsPdks = pkgs.callPackage ./nix/pdks.nix { };
          basicsDocsSite = pkgs.stdenvNoCC.mkDerivation {
            pname = "basics-docs-site";
            version = "0.1.0";
            src = "${basicsContent}/docs-site";
            dontBuild = true;
            installPhase = ''
              runHook preInstall
              mkdir -p "$out/share/basics/docs-site"
              cp -R . "$out/share/basics/docs-site/source"
              cat > "$out/share/basics/docs-site/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>bASICs VM Docs</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; max-width: 60rem; line-height: 1.5; }
    code { background: #f2f2f2; padding: 0.1rem 0.25rem; }
  </style>
</head>
<body>
  <h1>bASICs VM Docs</h1>
  <p>The full documentation source is bundled in <code>source/</code>. Public hosted docs are built outside the VM release path.</p>
  <ul>
    <li><a href="source/index.md">Overview</a></li>
    <li><a href="source/getting-started.md">Getting Started</a></li>
    <li><a href="source/reference/tools.md">Tools Inventory</a></li>
    <li><a href="source/advanced/reproduce-vm.md">Reproduce the VM</a></li>
  </ul>
</body>
</html>
EOF
              runHook postInstall
            '';
          };
          basicsTools = with pkgs; [
            basicsPython
            git
            gnumake
            jq
            rsync
            curl
            pre-commit
            vim
            nano
            tree

            openlane2.packages.${system}.openlane
            openlane2.packages.${system}.openroad
            openlane2.packages.${system}.opensta
            openlane2.packages.${system}.openroad-abc
            yosys
            magic-vlsi
            netgen
            ngspice
            klayout
            verilator
            (pkgs.iverilog or pkgs.verilog)
            gtkwave
            xschem
            volare
            graphviz
            xdot
            (pkgs.sby or pkgs.symbiyosys)
            z3
            yices
            boolector
            bitwuzla
            surelog
            uhdm
            ciel
            cvc5
          ];
        in
        {
          inherit pkgs basicsContent basicsAssets basicsTools basicsExamples basicsTemplates basicsPdks basicsDocsSite;
          profile = pkgs.symlinkJoin {
            name = "basics-profile-${system}";
            paths = basicsTools;
          };
        };
    in
    {
      packages = forAllSystems (system:
        let basics = basicsFor system;
        in {
          default = basics.profile;
          basics-profile = basics.profile;
          basics-examples = basics.basicsExamples;
          basics-templates = basics.basicsTemplates;
          basics-pdks = basics.basicsPdks;
          basics-docs-site = basics.basicsDocsSite;
          basics-assets = basics.basicsAssets;
          basics-image-qcow =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basics = basicsFor system;
                basicsVmRunner = true;
              };
              modules = [
                imageDiskSizeModule
                qcowImageDiskSizeModule
                ./nixos/basics.nix
              ];
              format = "qcow";
            };
          basics-image-repart =
            (nixpkgs-image.lib.nixosSystem {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basics = basicsFor system;
                basicsVmRunner = false;
              };
              modules = [
                ./nixos/basics.nix
                repartImageModule
              ];
            }).config.system.build.image;
        } // nixpkgs.lib.optionalAttrs (system == "x86_64-linux") {
          basics-image-virtualbox =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basics = basicsFor system;
                basicsVmRunner = true;
              };
              modules = [
                imageDiskSizeModule
                ./nixos/basics.nix
              ];
              format = "virtualbox";
            };
        });

      devShells = forAllSystems (system:
        let
          basics = basicsFor system;
          pkgs = basics.pkgs;
        in {
          default = pkgs.mkShell {
            packages = basics.basicsTools;
            shellHook = ''
              export BASICS_ROOT="$PWD/out/basics-root/opt/basics"
              export PDK_ROOT="$BASICS_ROOT/pdks"
              export BASICS_EXAMPLES="$PWD/examples"
              export BASICS_SKY130_OPEN_PDKS="0fe599b2afb6708d281543108caf8310912f54af"
              export BASICS_GF180MCU_OPEN_PDKS="c6d73a35f524070e85faff4a6a9eef49553ebc2b"
              echo "Basics dev shell"
              echo "  BASICS_ROOT=$BASICS_ROOT"
              echo "  PDK_ROOT=$PDK_ROOT"
            '';
          };
        });

      nixosConfigurations = {
        basics-x86_64 = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          specialArgs = {
            inherit self openlane2;
            basics = basicsFor "x86_64-linux";
            basicsVmRunner = true;
          };
          modules = [ ./nixos/basics.nix ];
        };

        basics-aarch64 = nixpkgs.lib.nixosSystem {
          system = "aarch64-linux";
          specialArgs = {
            inherit self openlane2;
            basics = basicsFor "aarch64-linux";
            basicsVmRunner = true;
          };
          modules = [ ./nixos/basics.nix ];
        };
      };
    };
}
