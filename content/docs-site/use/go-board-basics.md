# Your First Go Board Project

A starter LED blink and counter excercise!

The Go Board has a Lattice iCE40HX1K FPGA, four LEDs, four buttons, a 25 MHz
clock, USB programming, and onboard flash. Unlike a microcontroller, the
Verilog below describes circuits that all exist at once.

Your Verilog will go through Yosys, nextpnr-ice40, and icepack before it becomes
the `.bin` file you put on the board.

## Get the board ready

Before you start, make sure you have

- bASICs VM [version 1.1](../install/version-1-1.md) and above
- a Nandland Go Board plugged into your computer
- the Go Board [connected to your VM](../install/connecting-usb-devices.md)

In the VM terminal, use USButils to check that the board is visible.

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

### A first look at Verilog

Verilog describes a circuit. It doesn't run from top to bottom like a normal
program, but rather, when the FPGA starts, every part of the circuit below exists at once.

`module blink(...)` names the circuit and lists its connections. The
connections inside the parentheses are called **ports**. They are how the
circuit talks to the Go Board.

`input` and `output` are wires that connect your circuit to the outside of the
FPGA. A **wire** carries a value from one part of a circuit to another but doesn't 
remember anything by itself. `CLK` is a wire coming in from the Go Board's
clock. `LED1` is a wire going out to the first LED.

A **flip-flop** stores one bit. It remembers either `0` or `1` until the clock
tells it to update. It is a tiny piece of memory built into the FPGA. A
**register** is a group of flip-flops that work together. In this example,
`reg [23:0] count` is a 24-bit register, so it uses 24 flip-flops to remember a
number from 0 to 16,777,215.

The clock is a repeating signal. `posedge CLK` means the instant the clock
changes from `0` to `1`. The Go Board clock does this 25 million times each
second. (That's when the flip-flops in this circuit update). Between clock
edges, `count` keeps its old value.

The `always @(posedge CLK)` block describes what each flip-flop should store at
the next clock edge. `<=` means “save this new value at that edge.” Every
flip-flop in the block updates together, which is why hardware can do many
things at the same time.

`assign` makes a direct wire connection. Here,
it connects one bit of `count` directly to `LED1`.

Square brackets select bits. `count[23]` means bit 23 of the 24-bit number.
The low bits change very quickly. Bit 23 changes much more slowly, so it blinks.

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

First, run Yosys. It reads `blink.v` and turns the circuit into `blink.json`.

```sh
yosys -p 'read_verilog blink.v; synth_ice40 -top blink -json blink.json'
```

Next, run nextpnr. It chooses where the circuit goes inside the FPGA and uses
`go_board.pcf` to connect the circuit to the Go Board pins.

```sh
nextpnr-ice40 --hx1k --package vq100 --freq 25 --pcf go_board.pcf \
  --json blink.json --asc blink.asc
```

A trailing `\` means “continue on the next line.” If typing this on one line, omit the `\`; including it will cause errors.

Then use icepack to make `blink.bin`.

```sh
icepack blink.asc blink.bin
```

Put the bitstream on the board.

```sh
iceprog blink.bin
```

The command ends with `VERIFY OK`, and LED1 starts blinking.

## Count in binary

Open `counter.v`.

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

Run Yosys again for the counter circuit.

```sh
yosys -p 'read_verilog counter.v; synth_ice40 -top counter -json counter.json'
```

Place the counter circuit inside the FPGA.

```sh
nextpnr-ice40 --hx1k --package vq100 --freq 25 --pcf go_board.pcf \
  --json counter.json --asc counter.asc
```

A trailing `\` means “continue on the next line.” If typing this on one line, omit the `\`; including it will cause errors.

Make the counter bitstream.

```sh
icepack counter.asc counter.bin
```

Put it on the board.

```sh
iceprog counter.bin
```

The LEDs will count like this.

```text
0000 → 0001 → 0010 → 0011 → … → 1111 → 0000
```

Try changing `QUART_SECOND` in `counter.v`. A smaller number makes the LEDs
count faster.

## Start your own project

Make a new folder and copy in the Go Board pin map.

```sh
cd ~/bASICs/work
mkdir my-project
cd my-project
cp ../examples/nandland-go-board/go_board.pcf .
```

Create an empty Verilog file for your circuit.

```sh
touch my_project.v
```

Open `my_project.v` in your editor and start writing when you are ready. The
file can stay empty for now. When you add your circuit, name its top module
`my_project` to match the file name.

Keep `go_board.pcf` in the folder. It already has the pin definitions for everything

Use the names you need in your module. When you are ready to build it, run the
same four steps from the blink and counter examples with `my_project` in each
file name.

First, run Yosys. It reads your Verilog and turns the circuit into
`my_project.json`.

```sh
yosys -p 'read_verilog my_project.v; synth_ice40 -top my_project -json my_project.json'
```

Next, run nextpnr. It chooses where the circuit goes inside the FPGA and uses
`go_board.pcf` to connect your port names to the board pins.

```sh
nextpnr-ice40 --hx1k --package vq100 --freq 25 --pcf go_board.pcf \
  --json my_project.json --asc my_project.asc
```

A trailing `\` means “continue on the next line.” If typing this on one line, omit the `\`; including it will cause errors.

Then use icepack to make the bitstream file for the Go Board.

```sh
icepack my_project.asc my_project.bin
```

Finally, use iceprog to put that bitstream on the board.

```sh
iceprog my_project.bin
```
