# Windows ARM

Use this page for Windows PCs with an ARM processor.

> [!WARNING]
> Make sure your computer has at least 30 GB of free storage for the VM download and import.

## Install

1. Install [VirtualBox 7.2.8 for Windows](https://download.virtualbox.org/virtualbox/7.2.8/VirtualBox-7.2.8-173730-Win.exe).
2. Download [bASICs VM for Windows ARM](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/55ea8cb/windows-arm/basicsvm-aarch64-linux.vdi?download=true).
3. Open VirtualBox.
4. Create a new Linux VM.
5. Use the downloaded `.vdi` as the VM disk.
6. Start the VM.

The desktop logs in automatically. For SSH or terminal login:

```text
user: beaver
password: works
```

Next: [First Boot](../start/first-boot.md).
