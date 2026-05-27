{ imageDiskSizeMiB ? 80 * 1024
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

  virtualBoxImageModule = { lib, ... }: {
    virtualbox.baseImageSize = lib.mkForce imageDiskSizeMiB;
    virtualbox.memorySize = lib.mkForce 4096;
    virtualbox.vmName = lib.mkForce "bASICs VM";
    virtualbox.vmFileName = lib.mkForce "basicsvm-x86_64-linux.ova";
  };

  smokeVirtualBoxImageModule = { lib, ... }: {
    virtualbox.baseImageSize = lib.mkForce smokeDiskSizeMiB;
    virtualbox.baseImageFreeSpace = lib.mkForce 2048;
    virtualbox.memorySize = lib.mkForce 2048;
    virtualbox.vmName = lib.mkForce "bASICs Smoke";
    virtualbox.vmFileName = lib.mkForce "basicsvm-smoke-x86_64-linux.ova";
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
              SizeMinBytes = "80G";
              SizeMaxBytes = "80G";
            };
          };
        };
      };
    };
}
