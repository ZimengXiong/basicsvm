# Adder From Scratch

Build a tiny 2-bit registered adder by writing the Verilog yourself, simulating it, synthesizing it, choosing a PDK, and running OpenLane.

## Create the project

```bash
cd ~/bASICs/work
mkdir -p adder2/src
cd adder2
```

## Write the RTL

Create `src/adder2.v` in your editor.

Start with a module named `adder2`. Give it a clock, an active-low reset, two 2-bit inputs named `a` and `b`, and a 3-bit registered output named `sum`.

Write your own version first. Open the solution only when you want to compare it against a complete implementation.

::: details Show one working RTL solution

```verilog
module adder2 (
    input wire clk,        // Clock: the output updates on its rising edge.
    input wire rst_n,      // Active-low reset: reset is active when this is 0.
    input wire [1:0] a,    // First 2-bit input. It can hold values 0 through 3.
    input wire [1:0] b,    // Second 2-bit input. It can hold values 0 through 3.
    output reg [2:0] sum   // 3-bit output. 3 + 3 = 6, which needs 3 bits.
);
    // This block describes flip-flops. It runs on the clock edge and also
    // responds immediately when reset falls.
    always @(posedge clk or negedge rst_n) begin
        if (!rst_n) begin
            sum <= 3'b000; // Put the registered output in a known reset state.
        end else begin
            sum <= a + b;  // Store the addition result on the next clock edge.
        end
    end
endmodule
```

:::

## Write a testbench

Create `src/adder2_tb.v`. A testbench is simulation code. It is not part of the chip layout; it drives your RTL and checks the answers.

Make the testbench reset the design, try at least two input pairs, fail if the output is wrong, and write a waveform named `adder2.vcd`.

::: details Show one working testbench

```verilog
`timescale 1ns / 1ps // Simulation time unit is 1 ns; precision is 1 ps.

module adder2_tb;
    // These are driven by the testbench.
    reg clk = 0;
    reg rst_n = 0;
    reg [1:0] a = 0;
    reg [1:0] b = 0;

    // This observes the design output.
    wire [2:0] sum;

    // Instantiate the design under test and connect each port by name.
    adder2 dut (
        .clk(clk),
        .rst_n(rst_n),
        .a(a),
        .b(b),
        .sum(sum)
    );

    // Toggle the clock every 5 ns, making a 10 ns clock period.
    always #5 clk = ~clk;

    initial begin
        // Write a waveform file that GTKWave can open.
        $dumpfile("adder2.vcd");
        $dumpvars(0, adder2_tb);

        // Release reset after a little more than one clock edge.
        #12 rst_n = 1;

        // Drive 1 + 2, wait one clock, then check the registered result.
        a = 2'd1; b = 2'd2; #10;
        if (sum !== 3'd3) $fatal(1, "1 + 2 failed");

        // Drive the largest 2-bit addition, then check that 3 bits are enough.
        a = 2'd3; b = 2'd3; #10;
        if (sum !== 3'd6) $fatal(1, "3 + 3 failed");

        // End a passing simulation.
        $finish;
    end
endmodule
```

:::

## Simulate

Run a lint check first:

```bash
verilator --lint-only src/adder2.v
```

Compile and run the testbench:

```bash
iverilog -g2012 -o adder2_tb src/adder2.v src/adder2_tb.v
vvp adder2_tb
```

The simulation writes `adder2.vcd`. Open it when you want to inspect the clock, reset, inputs, and registered output:

```bash
gtkwave adder2.vcd
```

## Synthesize RTL

Ask Yosys to read your Verilog, synthesize the `adder2` top module, and write the synthesized netlist:

```bash
mkdir -p runs
yosys -p "read_verilog src/adder2.v; synth -top adder2; write_verilog runs/adder2.synth.v"
```

The synthesized Verilog is written to `runs/adder2.synth.v`.

## Pick the PDK

Use the SKY130A PDK that is already installed in the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
```

## Add Timing Constraints

Create `src/impl.sdc`:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

Create `src/signoff.sdc` with the same line:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

These files tell OpenLane that `clk` has a 10 ns period.

## Add Pin Order

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

This places `clk` and `rst_n` on the north side, and the input and output buses on the south side.

## Write OpenLane Config

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

Check the important parts before you run the flow:

- `DESIGN_NAME` matches the top module name.
- `VERILOG_FILES` points at the RTL that should become the chip layout.
- `CLOCK_PORT` names the clock signal.
- `PNR_SDC_FILE` and `SIGNOFF_SDC_FILE` point at the timing constraints.
- `FP_PIN_ORDER_CFG` points at the pin placement file.
- `STD_CELL_LIBRARY` selects the SKY130 standard-cell library.

## Run OpenLane

```bash
openlane --manual-pdk --pdk sky130A --pdk-root "$PDK_ROOT" config.yaml
```

The run can take several minutes. Near the end, a passing run prints `Flow complete`.

## Check the Output

Find the newest run directory:

```bash
run_dir="$(find runs -maxdepth 1 -mindepth 1 -type d | sort | tail -1)"
echo "$run_dir"
```

Look at the final layout outputs and check that the GDS exists:

```bash
tree "$run_dir/final" -L 1
test -s "$run_dir/final/gds/adder2.gds"
```

Open the final GDS:

```bash
klayout "$run_dir/final/klayout_gds/adder2.klayout.gds"
```
