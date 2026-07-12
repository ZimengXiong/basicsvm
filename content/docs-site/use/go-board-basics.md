# Go Board: First FPGA

This lab turns a Nandland Go Board into a real, visible FPGA project. You will
make an LED blink, then turn the four LEDs into a binary counter.

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

## What you need

* A Nandland Go Board and a USB cable.
* A terminal. These commands work on macOS or Linux.
* The open iCE40 tools. On macOS, install them once:

  ```sh
  brew install yosys nextpnr-ice40 icestorm
  ```

* APIO for reliable Go Board discovery and upload:

  ```sh
  python3 -m venv apio-env
  apio-env/bin/pip install apio
  ```

> [!TIP]
> Nandland's maintained APIO smoke test is `apio examples fetch
> go-board/blinky`, then `apio upload`. If you want to first prove that the
> cable and programmer work before typing any HDL, run that test.

## Part 1: Blink an LED

Create a clean folder for the lab:

```sh
mkdir -p ~/go-board-labs/blink
cd ~/go-board-labs/blink
```

Create `blink.v` with this exact circuit:

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

Create `blink.pcf`. A PCF is the map from our friendly names to the physical
pins on the Go Board:

```text
set_io clk 15
set_io led 56
```

Build the FPGA image one stage at a time:

```sh
yosys -p 'read_verilog blink.v; synth_ice40 -top blink -json blink.json'
nextpnr-ice40 --hx1k --package vq100 --freq 25 \
  --pcf blink.pcf --json blink.json --asc blink.asc
icepack blink.asc blink.bin
```

Success means all three commands finish without an error and `blink.bin`
exists. The `--hx1k --package vq100` flags matter: they select the FPGA and
package actually used by the Go Board.

### Flash it

The safest first upload is APIO because its `go-board` profile finds the USB
programmer for you. In a new empty directory, run Nandland's smoke test:

```sh
apio-env/bin/apio examples fetch go-board/blinky
apio-env/bin/apio upload
```

For your own `blink.bin`, use Lattice Diamond Programmer in **SPI Flash
Programming** mode with device **iCE40HX1K-VQ100**, then select `blink.bin`.
The board reloads the design from flash after programming.

> [!NOTE]
> The open-source `iceprog` uploader also works with the Go Board. Its USB
> location can change after reconnecting, so discover it with `apio devices
> scan-usb` or use `apio upload` rather than copying a device location from
> another computer.

## Part 2: Count in binary

Make a `counter.v` file. This version only changes its output every quarter of
a second, so your eyes can follow the binary count.

```verilog
module counter(
  input  clk,
  output led1, led2, led3, led4
);
  localparam [22:0] QUART_SECOND = 23'd6_250_000;
  reg [22:0] ticks = 0;
  reg [3:0] value = 0;

  always @(posedge clk) begin
    if (ticks == QUART_SECOND - 1'b1) begin
      ticks <= 0;
      value <= value + 1'b1;
    end else begin
      ticks <= ticks + 1'b1;
    end
  end

  assign {led4, led3, led2, led1} = value;
endmodule
```

Create `counter.pcf`:

```text
set_io clk 15
set_io led1 56
set_io led2 57
set_io led3 59
set_io led4 60
```

Build it by replacing `blink` with `counter` in the three build commands:

```sh
yosys -p 'read_verilog counter.v; synth_ice40 -top counter -json counter.json'
nextpnr-ice40 --hx1k --package vq100 --freq 25 \
  --pcf counter.pcf --json counter.json --asc counter.asc
icepack counter.asc counter.bin
```

Flash `counter.bin`. The LEDs should display:

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
