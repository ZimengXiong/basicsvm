{ imageDiskSizeMiB ? 30 * 1024
, smokeDiskSizeMiB ? 10 * 1024
}:

{
  imageDiskSizeModule = { lib, ... }: {
    virtualisation.diskSize = lib.mkForce imageDiskSizeMiB;
    virtualisation.memorySize = lib.mkForce 4096;
  };

  smokeDiskSizeModule = { lib, ... }: {
    virtualisation.diskSize = lib.mkForce smokeDiskSizeMiB;
  };

  virtualBoxImageModule = { config, lib, pkgs, modulesPath, ... }:
    let
      cfg = config.virtualbox;
    in
    {
      virtualbox.baseImageSize = lib.mkForce imageDiskSizeMiB;
      virtualbox.baseImageFreeSpace = lib.mkForce 2048;
      virtualbox.memorySize = lib.mkForce 4096;
      virtualbox.vmName = lib.mkForce "bASICs VM";
      virtualbox.vmFileName = lib.mkForce "basicsvm-x86_64-linux.ova";

      system.build.image = lib.mkForce config.system.build.virtualBoxOVA;
      system.build.virtualBoxOVA = lib.mkForce (import "${toString modulesPath}/../lib/make-disk-image.nix" {
        name = cfg.vmDerivationName;
        inherit pkgs lib config;
        partitionTableType = "legacy";
        diskSize = cfg.baseImageSize;
        additionalSpace = "${toString cfg.baseImageFreeSpace}M";
        copyChannel = false;
        memSize = 4096;
        postVM = ''
          export HOME=$PWD
          export PATH=${pkgs.virtualbox}/bin:$PATH

          echo "converting image to VirtualBox format..."
          VBoxManage convertfromraw "$diskImage" disk.vdi

          echo "creating VirtualBox VM..."
          vmName="${cfg.vmName}"
          VBoxManage createvm --name "$vmName" --register --ostype Linux_64
          VBoxManage modifyvm "$vmName" \
            --memory ${toString cfg.memorySize} \
            ${lib.cli.toGNUCommandLineShell { } cfg.params}
          VBoxManage storagectl "$vmName" ${lib.cli.toGNUCommandLineShell { } cfg.storageController}
          VBoxManage storageattach "$vmName" --storagectl ${cfg.storageController.name} --port 0 --device 0 --type hdd \
            --medium disk.vdi

          echo "exporting VirtualBox VM..."
          mkdir -p "$out"
          fn="$out/${cfg.vmFileName}"
          VBoxManage export "$vmName" --output "$fn" --options manifest ${lib.escapeShellArgs cfg.exportParams}
          ${cfg.postExportCommands}

          rm -v "$diskImage"

          mkdir -p "$out/nix-support"
          echo "file ova $fn" >> "$out/nix-support/hydra-build-products"
        '';
      });
    };

  smokeVirtualBoxImageModule = { config, lib, pkgs, modulesPath, ... }:
    let
      cfg = config.virtualbox;
    in
    {
      virtualbox.baseImageSize = lib.mkForce smokeDiskSizeMiB;
      virtualbox.baseImageFreeSpace = lib.mkForce 1024;
      virtualbox.memorySize = lib.mkForce 2048;
      virtualbox.vmName = lib.mkForce "bASICs Smoke";
      virtualbox.vmFileName = lib.mkForce "basicsvm-smoke-x86_64-linux.ova";

      system.build.image = lib.mkForce config.system.build.virtualBoxOVA;
      system.build.virtualBoxOVA = lib.mkForce (import "${toString modulesPath}/../lib/make-disk-image.nix" {
        name = cfg.vmDerivationName;
        inherit pkgs lib config;
        partitionTableType = "legacy";
        diskSize = cfg.baseImageSize;
        additionalSpace = "${toString cfg.baseImageFreeSpace}M";
        copyChannel = false;
        memSize = 2048;
        postVM = ''
          export HOME=$PWD
          export PATH=${pkgs.virtualbox}/bin:$PATH

          VBoxManage convertfromraw "$diskImage" disk.vdi
          vmName="${cfg.vmName}"
          VBoxManage createvm --name "$vmName" --register --ostype Linux_64
          VBoxManage modifyvm "$vmName" \
            --memory ${toString cfg.memorySize} \
            ${lib.cli.toGNUCommandLineShell { } cfg.params}
          VBoxManage storagectl "$vmName" ${lib.cli.toGNUCommandLineShell { } cfg.storageController}
          VBoxManage storageattach "$vmName" --storagectl ${cfg.storageController.name} --port 0 --device 0 --type hdd \
            --medium disk.vdi

          mkdir -p "$out"
          fn="$out/${cfg.vmFileName}"
          VBoxManage export "$vmName" --output "$fn" --options manifest ${lib.escapeShellArgs cfg.exportParams}
          ${cfg.postExportCommands}
          rm -v "$diskImage"

          mkdir -p "$out/nix-support"
          echo "file ova $fn" >> "$out/nix-support/hydra-build-products"
        '';
      });
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

  smokeQcowImageDiskSizeModule = { lib, config, pkgs, modulesPath, ... }: {
    system.build.qcow = lib.mkForce (import "${toString modulesPath}/../lib/make-disk-image.nix" {
      inherit lib config pkgs;
      diskSize = smokeDiskSizeMiB;
      format = "qcow2";
      partitionTableType = "hybrid";
      memSize = 2048;
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
      boot.initrd.includeDefaultModules = lib.mkForce true;

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
                  SizeMinBytes = "30G";
                  SizeMaxBytes = "30G";
                };
              };
        };
      };
    };
}
