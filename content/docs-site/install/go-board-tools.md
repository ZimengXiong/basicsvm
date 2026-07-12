# Optional: Nandland Go Board tools

Use this page if you already have a bASICs VM and want Go Board support now,
without downloading a new VM image. The command installs the missing iCE40 FPGA
tools into your personal Nix profile; it does not modify the system image.

## Install the tools

Open a terminal in the VM and run:

```bash
nix profile install \
  nixpkgs#nextpnr \
  nixpkgs#icestorm \
  nixpkgs#usbutils \
  --extra-experimental-features flakes \
  --extra-experimental-features nix-command
```

This gives you:

| Command | Purpose |
|---|---|
| `yosys` | Synthesizes Verilog (already included in bASICs VM). |
| `nextpnr-ice40` | Places and routes a design for the iCE40HX1K. |
| `icepack` | Packs the routed design into a flashable `.bin`. |
| `iceprog` | Writes and verifies the Go Board's SPI flash. |
| `lsusb` | Confirms that the VM can see the USB programmer. |

Close and reopen the terminal after installation, then verify the tools:

```bash
command -v yosys nextpnr-ice40 icepack iceprog lsusb
nextpnr-ice40 --help | head -n 1
iceprog --help | head -n 1
```

Every `command -v` result should be a path. The last two commands should print
usage text.

## Attach the physical board to the VM

The Go Board's USB chip must be connected to the **guest**, not just the host.
For most students this is a short UTM GUI task; SSH is not required.

### UTM: enable USB sharing once

1. Shut down the VM. In the UTM library, select **bASICs VM** and click
   **Edit**.
2. Select **Input** in the sidebar.
3. Under **USB Sharing**, tick **Share USB devices from host**. Leave
   **Maximum Shared USB Devices** at `3`, then click **Save**.

![UTM's Input panel; tick “Share USB devices from host” under USB Sharing.](/images/utm-usb-sharing-settings.jpg)

New bASICs UTM bundles have this setting enabled already. Check it once if the
USB menu is unavailable or the board never appears in the VM.

### UTM: connect the Go Board each time

1. Plug the Go Board into your Mac and start the VM.
2. In the running VM window, click **USB Devices** in UTM's toolbar.
3. Select **Dual RS232-HS**, then choose **Connect…**. The name may include a
   port such as `(1:3)`; choose the one labelled **Dual RS232-HS**.

![The UTM toolbar USB Devices menu path: Dual RS232-HS then Connect.](/images/utm-connect-go-board.svg)

### VirtualBox

Start the VM, then choose **Devices → USB → FTDI Dual RS232-HS**.

### Confirm it in the VM

Back in the VM, check for the board:

```bash
lsusb | grep -i ftdi
```

You should see vendor ID `0403` and product ID `6010`. If not, disconnect it
from the UTM USB menu and connect it again; then re-check the **Input** setting
above.

## Advanced: terminal-only UTM control (macOS)

This optional instructor/maintainer path is useful for repeatable checks. Use
the GUI steps above for classroom programming. After starting the UTM VM once,
UTM's shared network gives the guest a private address. Find it from the VM's
MAC address:

```bash
# On the Mac host, while the VM is running.
arp -an | grep '52:54'
```

The output includes a guest address such as `192.168.64.5`. Connect using the
bASICs VM credentials:

```bash
ssh beaver@192.168.64.5
```

From that SSH shell, run the install, build, and `iceprog` commands on this
page exactly as written. This is useful for running repeatable checks or
teaching from a host terminal. The VM's generated MAC address is recorded in
its `.utm/config.plist` under `Network → MacAddress`; if several VMs are
running, use that value to identify the correct `arp` entry.

## Build and flash the included example

Copy the Go Board example to your writable workspace:

```bash
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
make
```

This creates `blink.bin`. With the FTDI device attached to the VM, flash it:

```bash
iceprog blink.bin
```

Success ends with `VERIFY OK`; LED1 should blink. Build the four-LED counter
next:

```bash
make clean
make TOP=counter
iceprog counter.bin
```

See [Go Board: First FPGA](../use/go-board-basics.md) for the full explanation
of the Verilog, pin constraints, and the build pipeline.

## Remove later (optional)

To remove these standalone packages from your user profile, first list them:

```bash
nix profile list
```

Then remove the listed package numbers with `nix profile remove <number>`.
This does not affect the rest of the VM.
