# Version 1.4 stable

Released July 16, 2026.

[This is the latest version.]

[Download version 1.4 for Windows x86](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/1.4/windows-x86/basicsvm-x86_64-linux.ova)

[Download version 1.4 for Windows ARM](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/1.4/windows-arm/bASICs-VM-Windows-ARM.ova)

[Download version 1.4 for Apple Silicon](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/1.4/macos-apple-silicon/bASICs-VM-Apple-Silicon.utm.zip)

[Download version 1.4 for Intel Mac](https://huggingface.co/datasets/zimengxiong/basicsvm/resolve/main/releases/1.4/macos-intel/bASICs-VM-Intel-Mac.utm.zip)

## Changelog

- UTM shared directories mount automatically at `/home/beaver/Shared` with
  guest ownership mapped for the `beaver` user.
- Apple Silicon UTM uses the GPU-supported `virtio-gpu-gl-pci` display.
- Intel UTM keeps its compatible `virtio-vga` display and NVMe disk.
- Windows x86 includes VirtualBox shared-folder integration.
- Windows ARM includes the current VirtualBox guest integration.

[Guide to enabling folder sharing](../misc/enable-folder-sharing.md)

## Migrate

[Read the version 1.4 migration guide](./migrate-to-1-4.md)
