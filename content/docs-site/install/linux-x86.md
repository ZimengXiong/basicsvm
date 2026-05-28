# Linux x86

Use this page for Linux PCs with an Intel or AMD processor.

> [!WARNING]
> Make sure your computer has at least 30 GB of free storage for the VM download and import.

> [!NOTE]
> If you'd rather, you can also skip the VM all together and just use bare metal Openlane2 via `Nix` or `Docker`, we're sure you can figure the course out with it 🙂. Be sure to have some sort of Wayland/X11 passthrough for tools like Magic and KLayout.

## Install

1. Install [VirtualBox for Linux](https://www.virtualbox.org/wiki/Linux_Downloads).
2. Download [bASICs VM for Linux x86](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/0d09c41/linux-x86/basicsvm-x86_64-linux.ova?download=true).
3. Open VirtualBox.
4. Drag the downloaded `.ova` file into the VirtualBox window, or choose **File > Import Appliance** and select it.
5. Start the VM.


> [!NOTE]
> If for some reason you cannot use VirtualBox, grab the latest `qcow2` image from [here](https://huggingface.co/datasets/zimengxiong/basicsvm/blob/main/releases/0d09c41/linux-x86/basicsvm-x86_64-linux.qcow2), and set it up however you'd like.


The desktop logs in automatically.

Next: [First Boot](../start/first-boot.md).
