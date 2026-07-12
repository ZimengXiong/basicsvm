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

The Go Board's USB chip must be connected to the **guest**, not just the host:

* **UTM:** start the VM, then choose the USB button in the VM toolbar and attach
  **FTDI Dual RS232-HS**.
* **VirtualBox:** start the VM, then choose **Devices → USB → FTDI Dual
  RS232-HS**.

Back in the VM, check for it:

```bash
lsusb | grep -i ftdi
```

You should see vendor ID `0403` and product ID `6010`. If the command shows
nothing, detach it from the host application and attach it to the VM again.

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
