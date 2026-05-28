# Linux ARM

Use this page for Linux machines with an ARM processor.

> [!WARNING]
> Make sure your computer has at least 30 GB of free storage for the VM download and import.

> [!WARNING]
> Linux ARM is BYO Hypervisor, please set up your own solution. 

> [!NOTE]
> If you'd rather, you can also skip the VM all together and just use bare metal Openlane2 via `Nix` or `Docker`, we're sure you can figure the course out with it 🙂. Be sure to have some sort of Wayland/X11 passthrough for tools like Magic and KLayout.

## Install

1. Download [bASICs VM for Linux ARM](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/0d09c41/linux-arm/basicsvm-aarch64-linux.qcow2?download=true).
2. Create an ARM virtual machine with QEMU.
3. Attach the downloaded `.qcow2` as the VM disk.
4. Setup VNC or `virt-manager` to attach into your VM

The desktop logs in automatically.

Next: [First Boot](../start/first-boot.md).
