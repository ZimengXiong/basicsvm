# Your First Go Board Project

You will make an LED blink, then turn the four LEDs into a binary counter.

The Go Board has a Lattice iCE40HX1K FPGA, four LEDs, four buttons, a 25 MHz
clock, USB programming, and onboard flash. Unlike a microcontroller, the
Verilog below describes circuits that all exist at once.

## Tool flow
```
Verilog + pin constraints
->
Yosys
->
nextpnr-ice40
->
icepack → Go Board flash
```

* Yosys turns the Verilog circuit into iCE40 logic.
* nextpnr-ice40 assigns that logic to real FPGA cells and pins.
* icepack creates the `.bin` file stored in the board's flash.

## Get the board ready

The current bASICs VM already includes Yosys, nextpnr-ice40, icepack, and
iceprog. Plug the Go Board into your computer, start the VM, then use UTM's
**USB Devices** toolbar button to connect **Dual RS232-HS**.

In the VM terminal, check that the board is visible.

```sh
lsusb | grep -i ftdi
```

You should see `0403:6010`. If you do not, the
[USB-sharing guide](../install/go-board-tools.md#utm-usb-sharing)
shows exactly where to enable it.

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

`count` increases 25 million times each second. Its 24th bit changes slowly
enough for your eye to see, so connecting that bit to `LED1` makes the LED
blink.

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

Open `counter.v` and change `QUART_SECOND` to make the count faster or slower.
That one number controls how long the FPGA waits between each new value.

## Start your own project

Keep `go_board.pcf` in your project. It already names every board feature you
can use, including the clock, buttons, LEDs, both seven-segment displays,
serial, VGA, and the PMOD header.

Write a top-level module using the names you need. Then build it with

```sh
make TOP=my_project
iceprog my_project.bin
```

For example, a VGA project can use `VGA_HS`, `VGA_VS`, `VGA_R0` through
`VGA_R2`, `VGA_G0` through `VGA_G2`, and `VGA_B0` through `VGA_B2`. The pin
map is already there; you only add the Verilog for your idea.

When you are ready, try [Adder From Scratch](./adder-from-scratch.md).
