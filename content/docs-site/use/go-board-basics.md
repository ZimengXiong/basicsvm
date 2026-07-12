# Your First Go Board Project

You will make an LED blink, then turn the four LEDs into a binary counter.

The Go Board has a Lattice iCE40HX1K FPGA, four LEDs, four buttons, a 25 MHz
clock, USB programming, and onboard flash. Unlike a microcontroller, the
Verilog below describes circuits that all exist at once.

Your Verilog goes through Yosys, nextpnr-ice40, and icepack before it becomes
the `.bin` file you put on the board. You can mostly think of `make` as taking
care of that for you.

## Get the board ready

Before you start, make sure you have

- bASICs VM [version 1.1](../install/version-1-1.md) or newer
- a Nandland Go Board plugged into your computer
- the Go Board [connected to your VM](../install/connecting-usb-devices.md)

In the VM terminal, check that the board is visible.

```sh
lsusb
```

Look for **Dual UART / FIFO IC** in the list. If it is not there, the
[USB connection steps](../install/connecting-usb-devices.md) will help.

## Make an LED blink

Copy the included example into your workspace.

```sh
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
```

The starter `blink.v` has this little circuit inside.

```verilog
// This module becomes the top-level circuit named "blink".
module blink(
  input  CLK,     // The Go Board's 25 MHz clock.
  output LED1     // The first LED on the board.
);
  // 24 flip-flops that hold a number. They begin at zero.
  reg [23:0] count = 0;

  // Run this hardware update on every rising clock edge.
  always @(posedge CLK)
    // Add one to the stored number.
    count <= count + 1'b1;

  // Bit 23 changes slowly enough for your eye to see the LED blink.
  assign LED1 = count[23];
endmodule
```

Build the FPGA image.

```sh
make
```

This creates `blink.bin`. Put it on the board.

```sh
iceprog blink.bin
```

The command ends with `VERIFY OK`, and LED1 starts blinking.

## Count in binary

Open `counter.v`. Its comments explain the whole circuit.

```verilog
// This module becomes the top-level circuit named "counter".
module counter(
  input CLK,     // The Go Board's 25 MHz clock.
  output LED1,   // The lowest bit of the displayed number.
  output LED2,
  output LED3,
  output LED4    // The highest bit of the displayed number.
);
  // 6,250,000 clock ticks are one quarter of a second at 25 MHz.
  localparam [22:0] QUART_SECOND = 23'd6_250_000;
  // This counts fast clock ticks until a quarter second has passed.
  reg [22:0] ticks = 0;
  // This is the four-bit number shown on the LEDs.
  reg [3:0] value = 0;

  // Update the registers on every rising edge of the clock.
  always @(posedge CLK) begin
    // Has this quarter-second wait finished?
    if (ticks == QUART_SECOND - 1'b1) begin
      // Start timing the next quarter second.
      ticks <= 0;
      // Move to the next four-bit number.
      value <= value + 1'b1;
    end else begin
      // Keep waiting for the quarter second to finish.
      ticks <= ticks + 1'b1;
    end
  end

  // Send value bits 0 through 3 to LED1 through LED4.
  assign {LED4, LED3, LED2, LED1} = value;
endmodule
```

Build it.

```sh
make clean
make TOP=counter
```

The LEDs will count like this.

```text
0000 → 0001 → 0010 → 0011 → … → 1111 → 0000
```

Try changing `QUART_SECOND` in `counter.v`. A smaller number makes the LEDs
count faster.

## Start your own project

Keep `go_board.pcf` in your project. It already has the names for the clock,
buttons, LEDs, seven-segment displays, serial, VGA, and the PMOD header.

Write a top-level module using the names you need. Then build it with

```sh
make TOP=my_project
iceprog my_project.bin
```

For a VGA project, use `VGA_HS`, `VGA_VS`, `VGA_R0` through `VGA_R2`,
`VGA_G0` through `VGA_G2`, and `VGA_B0` through `VGA_B2`. You write the
Verilog and the pin map is already done.
