# Adder From Scratch

This guide builds a small 2-bit registered adder by writing the project files yourself, then running simulation, synthesis, and OpenLane with SKY130.

## Create the project

```bash
cd ~/bASICs/work
mkdir -p adder2/src
cd adder2
```

## Write the RTL

Create `src/adder2.v` in your editor and write a module named `adder2`.

Your circuit should have:

- `clk`: clock input
- `rst_n`: active-low reset input
- `a`: 2-bit input
- `b`: 2-bit input
- `sum`: 3-bit registered output

Try writing it yourself first. Use the explanation below to check each part.

::: details Show one working RTL solution

```verilog
module adder2 (
    input wire clk,
    input wire rst_n,
    input wire [1:0] a,
    input wire [1:0] b,
    output reg [2:0] sum
);
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            sum <= 3'b000;
        end else begin
            sum <= a + b;
        end
    end
endmodule
```

:::

What each part does:

- `module adder2 (...)` starts the hardware block and lists its ports.
- `input wire [1:0] a` and `b` are 2-bit buses. They can hold values from `0` to `3`.
- `output reg [2:0] sum` is 3 bits because `3 + 3 = 6`, which needs 3 bits.
- `always @(posedge clk or negedge rst_n)` describes flip-flop logic that updates on the clock or reset edge.
- `if (!rst_n)` handles reset when `rst_n` is low.
- `sum <= a + b` stores the addition result into the output register on the next clock edge.
- `endmodule` closes the module.

## Write a testbench

Create `src/adder2_tb.v`. The testbench is not hardware for the chip; it drives your RTL in simulation.

Your testbench should:

- create a clock
- reset the design
- drive at least two input cases
- check that `sum` has the expected value
- write a waveform file named `adder2.vcd`

::: details Show one working testbench

```verilog
`timescale 1ns / 1ps

module adder2_tb;
    reg clk = 0;
    reg rst_n = 0;
    reg [1:0] a = 0;
    reg [1:0] b = 0;
    wire [2:0] sum;

    adder2 dut (
        .clk(clk),
        .rst_n(rst_n),
        .a(a),
        .b(b),
        .sum(sum)
    );

    always #5 clk = ~clk;

    initial begin
        $dumpfile("adder2.vcd");
        $dumpvars(0, adder2_tb);

        #12 rst_n = 1;

        a = 2'd1; b = 2'd2; #10;
        if (sum !== 3'd3) $fatal(1, "1 + 2 failed");

        a = 2'd3; b = 2'd3; #10;
        if (sum !== 3'd6) $fatal(1, "3 + 3 failed");

        $finish;
    end
endmodule
```

:::

What each part does:

- `` `timescale 1ns / 1ps `` sets the simulation time unit and precision.
- `reg clk`, `rst_n`, `a`, and `b` are signals the testbench controls.
- `wire [2:0] sum` observes the output from the design.
- `adder2 dut (...)` instantiates the design under test and connects each port.
- `always #5 clk = ~clk` toggles the clock every 5 ns, making a 10 ns period.
- `$dumpfile` and `$dumpvars` create the waveform file for GTKWave.
- `#12 rst_n = 1` releases reset after a little more than one clock edge.
- The `a = ...; b = ...; #10;` lines apply inputs and wait one clock period.
- `$fatal` stops the simulation with an error if the output is wrong.
- `$finish` ends a passing simulation.

## Simulate

```bash
verilator --lint-only src/adder2.v
iverilog -g2012 -o adder2_tb src/adder2.v src/adder2_tb.v
vvp adder2_tb
```

The simulation writes `adder2.vcd`. To inspect the waveform:

```bash
gtkwave adder2.vcd
```

## Synthesize RTL

```bash
mkdir -p runs
yosys -p "read_verilog src/adder2.v; synth -top adder2; write_verilog runs/adder2.synth.v"
```

This checks that Yosys can turn your RTL into gates. The synthesized Verilog is written to `runs/adder2.synth.v`.

## Pick the PDK

Use the SKY130A PDK already installed in the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
```

## Add timing constraints

Create `src/impl.sdc`:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

Create `src/signoff.sdc` with the same line:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

This tells implementation and signoff that `clk` has a 10 ns period.

## Add pin order

Create `pin_order.cfg`:

```text
#N
clk
rst_n

#S
a.*
b.*
sum.*
```

This asks OpenLane to place `clk` and `rst_n` on the north side, and the buses on the south side.

## Write the OpenLane config

Create `config.yaml`:

```yaml
DESIGN_NAME: adder2
VERILOG_FILES: dir::src/adder2.v
CLOCK_PORT: clk
CLOCK_PERIOD: 10

PNR_SDC_FILE: dir::src/impl.sdc
SIGNOFF_SDC_FILE: dir::src/signoff.sdc
FP_PIN_ORDER_CFG: dir::pin_order.cfg

FP_CORE_UTIL: 30
PL_TARGET_DENSITY_PCT: 55

FP_PDN_VOFFSET: 5
FP_PDN_HOFFSET: 5
FP_PDN_VWIDTH: 2
FP_PDN_HWIDTH: 2
FP_PDN_VPITCH: 30
FP_PDN_HPITCH: 30
FP_PDN_SKIPTRIM: true

pdk::sky130*:
  STD_CELL_LIBRARY: sky130_fd_sc_hd
```

Important fields:

- `DESIGN_NAME` must match the top module name.
- `VERILOG_FILES` points to the RTL that should become a chip layout.
- `CLOCK_PORT` and `CLOCK_PERIOD` tell OpenLane which signal is the clock.
- `PNR_SDC_FILE` and `SIGNOFF_SDC_FILE` point to the timing constraints.
- `FP_PIN_ORDER_CFG` points to your pin placement file.
- `STD_CELL_LIBRARY` selects the SKY130 standard-cell library.

## Run OpenLane

```bash
openlane --manual-pdk --pdk sky130A --pdk-root "$PDK_ROOT" config.yaml
```

## Check the output

```bash
run_dir="$(find runs -maxdepth 1 -mindepth 1 -type d | sort | tail -1)"
echo "$run_dir"
tree "$run_dir/final" -L 1
test -s "$run_dir/final/gds/adder2.gds"
```

A successful run prints `Flow complete` near the end and creates:

```text
final
├── def
├── gds
├── klayout_gds
├── lef
├── mag
├── metrics.csv
├── metrics.json
├── nl
├── sdc
├── spice
└── ...
```

Open the GDS:

```bash
klayout "$run_dir/final/klayout_gds/adder2.klayout.gds"
```
