# Go Board: setup, versions, and extras

The current bASICs VM is ready for the Go Board. You can write Verilog, build a
bitstream, and program the board without installing anything else.

## Latest bASICs VM

1. Plug the Go Board into your computer.
2. Start the VM.
3. In UTM, click **USB Devices** in the VM toolbar.
4. Choose **Dual RS232-HS**, then **Connect…**.
5. In the VM terminal, run:

   ```sh
   lsusb | grep -i ftdi
   ```

When the command shows `0403:6010`, the board is ready. Continue with
[Go Board: First FPGA](../use/go-board-basics.md).

## Miscellaneous: UTM USB sharing

Most current VM bundles already have USB sharing enabled. If **Dual RS232-HS**
does not appear in UTM's USB menu, turn it on once:

1. Shut down the VM.
2. In UTM's library, select **bASICs VM** and click **Edit**.
3. Open **Input**.
4. Under **USB Sharing**, tick **Share USB devices from host**.
5. Leave **Maximum Shared USB Devices** at `3`, then click **Save**.

<video controls playsinline preload="metadata" style="max-width: 100%; border-radius: 8px;">
  <source src="/videos/utm-go-board-usb-sharing.mp4" type="video/mp4">
  Your browser does not support embedded video.
</video>

The recording shows the whole path: enable USB sharing, connect the Go Board,
and check it with `lsusb` in the VM.

![UTM's Input panel. Tick “Share USB devices from host” under USB Sharing.](/images/utm-usb-sharing-settings.jpg)

## Other versions and patches

### An older bASICs VM

If your VM was made before Go Board support was included, install the tools in
your own profile:

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

Close and reopen the terminal, then check that the tools are available:

```bash
command -v yosys nextpnr-ice40 icepack iceprog lsusb
```

Copy the starter project and make the blink design:

```bash
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
make
iceprog blink.bin
```

### VirtualBox

Start the VM, then choose **Devices → USB → FTDI Dual RS232-HS**. Back in the
VM, run `lsusb | grep -i ftdi` before programming the board.

## Miscellaneous: terminal access and cleanup

Instructors can use SSH for repeatable checks after the VM has started:

```bash
arp -an | grep '52:54'
ssh beaver@192.168.64.5
```

To remove standalone packages later, list them with `nix profile list`, then
run `nix profile remove <number>`. This does not affect the rest of the VM.
