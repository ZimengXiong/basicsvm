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
      imageModules = import ./nix/image-modules.nix { };
      basicsFor = system:
        let
          pkgs = pkgsFor system;
        in
        import ./nix/basics-profile.nix {
          inherit pkgs system openlane2;
          basicsContent = ./content;
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
          basics-smoke-qcow =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basicsVmRunner = true;
              };
              modules = [
                imageModules.smokeDiskSizeModule
                imageModules.smokeQcowImageDiskSizeModule
                ./nixos/smoke.nix
              ];
              format = "qcow";
            };
          basics-image-qcow =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basics = basicsFor system;
                basicsVmRunner = true;
              };
              modules = [
                imageModules.imageDiskSizeModule
                imageModules.qcowImageDiskSizeModule
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
                imageModules.repartImageModule
              ];
            }).config.system.build.image;
        } // nixpkgs.lib.optionalAttrs (system == "x86_64-linux") {
          basics-image-virtualbox =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basics = basicsFor system;
                basicsVmRunner = false;
              };
              modules = [
                imageModules.virtualBoxImageModule
                ./nixos/basics.nix
              ];
              format = "virtualbox";
            };
          basics-smoke-virtualbox =
            nixos-generators.nixosGenerate {
              inherit system;
              specialArgs = {
                inherit self openlane2;
                basicsVmRunner = false;
              };
              modules = [
                imageModules.smokeVirtualBoxImageModule
                ./nixos/smoke.nix
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

        smoke-x86_64 = nixpkgs.lib.nixosSystem {
          system = "x86_64-linux";
          specialArgs = {
            inherit self openlane2;
            basicsVmRunner = true;
          };
          modules = [ ./nixos/smoke.nix ];
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

        smoke-aarch64 = nixpkgs.lib.nixosSystem {
          system = "aarch64-linux";
          specialArgs = {
            inherit self openlane2;
            basicsVmRunner = true;
          };
          modules = [ ./nixos/smoke.nix ];
        };
      };
    };
}
