# Adder From Scratch

Build a tiny 2-bit registered adder by writing the Verilog yourself, simulating it, synthesizing it, choosing a PDK, and running OpenLane all the way to a GDS layout.

You are going to make a small digital circuit and then turn it into the kind of layout file that a chip factory can manufacture.

- **Verilog** is the text language you will use to describe the circuit.
- **RTL** means register-transfer level. It describes what happens between registers on each clock cycle.
- **Simulation** runs your Verilog like a program so you can check the behavior before making a layout.
- **Synthesis** turns RTL into a netlist made of standard cells such as gates and flip-flops.
- **A PDK** is the process design kit. It tells the tools the design rules and cell libraries for a real manufacturing process.
- **OpenLane** places the cells, routes wires between them, checks the result, and writes the final layout files.

The circuit is intentionally small. The point is to see every part of the RTL-to-GDS path once, not to build a useful calculator.

## Create the project

Start in `~/bASICs/work`, the writable workspace in the VM. A project is just a folder with source files, constraints, configuration, and tool output.

```bash
cd ~/bASICs/work
mkdir -p adder2/src
cd adder2
```

## Write the RTL

RTL is the part of the project that describes the hardware you want. For this design, the hardware is one register named `sum` and a small adder feeding it. The register matters because real chips usually update data on clock edges instead of changing every signal at any time.

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

Before making a layout, check that the RTL behaves correctly. A testbench is simulation-only Verilog. It is not part of the chip layout; it drives your RTL, waits for clock edges, and checks the answers.

Create `src/adder2_tb.v`.

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

Simulation is your first feedback loop. It answers: “Does my RTL do the thing I meant?” It does not prove the circuit can be manufactured, but it catches basic logic mistakes before the slower physical-design flow.

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

Synthesis changes the design from “behavior described in Verilog” into “connected hardware cells.” Yosys reads the RTL, chooses gates and flip-flops, and writes a synthesized Verilog netlist. The netlist is still text, but it is much closer to the physical circuit OpenLane will place and route.

Ask Yosys to read your Verilog, synthesize the `adder2` top module, and write the synthesized netlist:

```bash
mkdir -p runs
yosys -p "read_verilog src/adder2.v; synth -top adder2; write_verilog runs/adder2.synth.v"
```

The synthesized Verilog is written to `runs/adder2.synth.v`.

## Pick the PDK

A chip layout depends on the manufacturing process. The PDK contains the rules for that process: metal layers, spacing rules, standard cells, timing data, and tool setup. This VM includes SKY130A, an open 130 nm PDK.

Use the SKY130A PDK that is already installed in the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
```

## Add Timing Constraints

OpenLane needs to know how fast the clock should be. Timing constraints say, “build and check this circuit as if `clk` has this period.” A 10 ns clock period means a 100 MHz clock.

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

The layout needs physical pins around the edge of the block. This file gives OpenLane a simple placement preference so the clock and reset are on one side and the data signals are on another.

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

The OpenLane config connects your project files to the physical-design flow. It names the top module, points at the RTL and constraint files, chooses the clock, sets simple floorplan options, and selects the SKY130 standard-cell library.

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

OpenLane now runs the physical implementation flow. It will lint the design, synthesize it again for the full flow, floorplan the chip block, place cells, route wires, run checks, and write final layout outputs.

```bash
openlane --manual-pdk --pdk sky130A --pdk-root "$PDK_ROOT" config.yaml
```

The run can take several minutes. Near the end, a passing run prints `Flow complete`.

## Check the Output

GDS is the final layout format you are looking for. It contains the geometry of the chip block: shapes on manufacturing layers, not Verilog behavior. For this guide, success means OpenLane produced a non-empty `adder2.gds` and KLayout can open it.

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
