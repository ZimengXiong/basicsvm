# Your First Go Board Project

You will make an LED blink, then turn the four LEDs into a binary counter.

The Go Board has a Lattice iCE40HX1K FPGA, four LEDs, four buttons, a 25 MHz
clock, USB programming, and onboard flash. Unlike a microcontroller, the
Verilog below describes circuits that all exist at once.

Your Verilog goes through Yosys, nextpnr-ice40, and icepack before it becomes
the `.bin` file you put on the board. You can mostly think of `make` as taking
care of that for you.

## Get the board ready

Version 1.1 already has the tools for this lesson. If you are using version
1.0, follow [Migrating to version 1.1](../install/migrate-to-1-1.md) first.

Plug the Go Board into your computer, start the VM, then use UTM's **USB
Devices** toolbar button to connect **Dual RS232-HS**.

In the VM terminal, check that the board is visible.

```sh
lsusb
```

Look for **Dual UART / FIFO IC** in the list. If it is not there, the
[UTM USB sharing steps](#if-utm-does-not-see-the-board) will help.

### If UTM does not see the board

Shut down the VM. In UTM, select the VM, click **Edit**, open **Input**, and
tick **Share USB devices from host**. Start the VM again, then connect **Dual
RS232-HS** from the **USB Devices** menu.

<video controls playsinline preload="metadata" style="max-width: 100%; border-radius: 8px;">
  <source src="/videos/utm-go-board-usb-sharing.mp4" type="video/mp4">
  Your browser does not support embedded video.
</video>

The video walks through the whole thing.

## Make an LED blink

Copy the included example into your workspace.

```sh
cd ~/bASICs/work
cp -R ../examples/nandland-go-board my-go-board
cd my-go-board
```

The starter `blink.v` has this little circuit inside.

```verilog
module blink(
  input  CLK,
  output LED1
);
  reg [23:0] count = 0;

  always @(posedge CLK)
    count <= count + 1'b1;

  assign LED1 = count[23];
endmodule
```

`count` keeps going up. Bit 23 changes slowly enough to make LED1 blink.

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

Build the second included project.

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

When you are ready, try [Adder From Scratch](./adder-from-scratch.md).
