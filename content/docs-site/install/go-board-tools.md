# Add Go Board tools to version 1.0

Version 1.1 already has the Go Board tools. This page is for version 1.0 when
you want to add them yourself.

You can also download version 1.1 and start fresh. See
[Versions and updates](./versions.md) if you want to choose between the two.

## Add the tools

Run this in a VM terminal.

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

Open a new terminal when it finishes.

## Connect the board

1. Plug the Go Board into your computer.
2. Start the VM.
3. In UTM, click **USB Devices** in the VM toolbar.
4. Choose **Dual RS232-HS**, then **Connect…**.
5. In the VM terminal, run

   ```sh
   lsusb | grep -i ftdi
   ```

When the command shows `0403:6010`, the board is ready. Continue with
[Your First Go Board Project](../use/go-board-basics.md).

## UTM USB sharing

Most current VM bundles already have USB sharing enabled. If **Dual RS232-HS**
does not appear in UTM's USB menu, turn it on once.

1. Shut down the VM.
2. In UTM's library, select **bASICs VM** and click **Edit**.
3. Open **Input**.
4. Under **USB Sharing**, tick **Share USB devices from host**.
5. Leave **Maximum Shared USB Devices** at `3`, then click **Save**.

<video controls playsinline preload="metadata" style="max-width: 100%; border-radius: 8px;">
  <source src="/videos/utm-go-board-usb-sharing.mp4" type="video/mp4">
  Your browser does not support embedded video.
</video>

The video walks through enabling USB sharing, connecting the Go Board, and
checking it with `lsusb`.

![UTM's Input panel. Tick “Share USB devices from host” under USB Sharing.](/images/utm-usb-sharing-settings.jpg)

## Make a quick test

```bash
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
make
iceprog blink.bin
```

## VirtualBox

Start the VM, then choose **Devices → USB → FTDI Dual RS232-HS**. Back in the
VM, run `lsusb | grep -i ftdi` before programming the board.

## Terminal access and cleanup

If you prefer working from your Mac terminal, you can SSH into the running VM.

```bash
arp -an | grep '52:54'
ssh beaver@192.168.64.5
```

To remove standalone packages later, list them with `nix profile list`, then
run `nix profile remove <number>`. This does not affect the rest of the VM.
