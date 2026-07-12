# Go Board: First FPGA

This lab turns a Nandland Go Board into a real, visible FPGA project from
**inside the bASICs VM**. You will make an LED blink, then turn the four LEDs
into a binary counter.

The Go Board has a Lattice iCE40HX1K FPGA, four LEDs, four buttons, a 25 MHz
clock, USB programming, and onboard flash. Unlike a microcontroller, the
Verilog below describes circuits that all exist at once.

## The open-source tool flow

```text
Verilog + pin constraints → Yosys → nextpnr-ice40 → icepack → Go Board flash
```

* **Yosys** turns the Verilog circuit into iCE40 logic.
* **nextpnr-ice40** assigns that logic to real FPGA cells and pins.
* **icepack** creates the `.bin` file stored in the board's flash.

Yosys is essential, but it is only the first step. It does not by itself make a
flashable image or program the board.

## What the VM already includes

The VM image includes `yosys`, `nextpnr-ice40`, `icepack`, and `iceprog`, plus
a ready-to-copy `nandland-go-board` example. You only need the physical Go
Board, a USB cable, and a VM platform that supports USB passthrough.

> [!WARNING]
> Connecting the board to your host computer is not enough. Attach the FTDI
> **Dual RS232-HS** USB device to the running VM. In UTM, use the **USB
> Devices** toolbar button, then choose **Dual RS232-HS → Connect…**. Confirm
> it is visible in the guest with `lsusb` before trying to program it. See the
> [illustrated USB-sharing setup](../install/go-board-tools.md#attach-the-physical-board-to-the-vm)
> if this is your first time.

## Part 1: Blink an LED

Copy the included example into your writable workspace:

```sh
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
```

The starter `blink.v` contains this exact circuit:

```verilog
module blink(
  input  clk,
  output led
);
  // 24 bits can count past 12.5 million clock ticks.
  reg [23:0] count = 0;

  // This is a register: it updates once on every rising clock edge.
  always @(posedge clk)
    count <= count + 1'b1;

  // Bit 23 changes about 1.5 times per second, which is easy to see.
  assign led = count[23];
endmodule
```

`go_board.pcf` is the map from our friendly names to the physical pins on the
Go Board:

```text
set_io -nowarn CLK 15
set_io -nowarn LED1 56
```

Build the FPGA image:

```sh
make
```

Success means `blink.bin` exists. Open the `Makefile` to see the three commands
it runs. The `--hx1k --package vq100` flags matter: they select the FPGA and
package actually used by the Go Board.

### Flash it

Once the board appears in the VM, flash it from the same folder:

```sh
iceprog blink.bin
```

`iceprog` writes the onboard SPI flash, verifies the bytes it wrote, and the
board reloads the design from flash. A successful upload ends in `VERIFY OK`.

## Part 2: Count in binary

The included `counter.v` changes its output every quarter second, so your eyes
can follow the binary count.

```verilog
module counter(
  input CLK,
  output LED1, LED2, LED3, LED4
);
  localparam [22:0] QUART_SECOND = 23'd6_250_000;
  reg [22:0] ticks = 0;
  reg [3:0] value = 0;

  always @(posedge CLK) begin
    if (ticks == QUART_SECOND - 1'b1) begin
      ticks <= 0;
      value <= value + 1'b1;
    end else begin
      ticks <= ticks + 1'b1;
    end
  end

  assign {LED4, LED3, LED2, LED1} = value;
endmodule
```

Build it using the same shared PCF:

```sh
make clean
make TOP=counter
```

Flash `counter.bin` from the guest:

```sh
iceprog counter.bin
```

The LEDs should display:

```text
0000 → 0001 → 0010 → 0011 → … → 1111 → 0000
```

The LEDs show a four-bit number, with LED1 as the least significant bit. This
is a clock enable pattern: the FPGA still receives 25 million clock edges each
second, but `value` changes only when the `ticks` counter reaches its limit.

## Challenges

1. Change `QUART_SECOND` to make the counter run twice as fast.
2. Replace `value + 1'b1` with `value - 1'b1` and predict the LEDs.
3. Add `input button` and reset `value` to zero while the button is held. You
   will also need to add `set_io button 53` to `counter.pcf`.
4. Drive `led1` from `pwm_count < brightness` to create a breathing LED.

## Troubleshooting

| Symptom | Check |
|---|---|
| `yosys: command not found` | Install the three Homebrew packages, then open a new terminal. |
| `nextpnr` cannot find the device | Reinstall `icestorm`; it provides the iCE40 device database. |
| The programmer cannot find the board | Disconnect other FTDI USB devices, reconnect the Go Board, then run `apio devices scan-usb`. |
| The board does not change after upload | Confirm that you used SPI Flash mode and selected `.bin`, not `.asc` or `.json`. |
| LEDs appear reversed | Check the LED pin names and assignments in the PCF before changing pin numbers. |

Next, try [Adder From Scratch](./adder-from-scratch.md) to see the same Verilog
thinking move from an FPGA board toward a physical ASIC layout.
