# Adder From Scratch

Build a 2-bit registered adder by writing Verilog, simulating it, synthesizing it, choosing a PDK, and running OpenLane to produce a GDS layout.

The circuit has two 2-bit inputs, `a` and `b`. Each input can hold a number from 0 to 3. The circuit adds them together and stores the answer in `sum` on each rising edge of `clk`.

The output is 3 bits wide because the largest result is `3 + 3 = 6`, and 6 needs 3 bits in binary.

```mermaid
flowchart LR
  a["a[1:0]<br/>0 to 3"] --> add["2-bit adder<br/>a + b"]
  b["b[1:0]<br/>0 to 3"] --> add
  add --> reg["sum register<br/>stores on rising edge"]
  clk["clk<br/>0 to 1"] --> reg
  rst["rst_n<br/>0 resets sum"] --> reg
  reg --> sum["sum[2:0]<br/>0 to 6"]
```

Terms in this circuit:

- `a[1:0]` and `b[1:0]` are 2-bit buses. The bits are numbered 1 down to 0.
- `sum[2:0]` is a 3-bit bus. The extra bit holds the carry from the addition.
- `clk` is the clock. A clock is a signal that repeatedly changes between 0 and 1.
- A **rising edge** is the moment when `clk` changes from 0 to 1.
- A **register** stores a value. Here, `sum` stores the adder result on the rising edge of `clk`.
- `rst_n` is an active-low reset. The `_n` suffix means the reset is active when the signal is 0.
- When reset is active, `sum` is forced to 0 instead of storing `a + b`.

You will use these terms throughout the guide:

- **Verilog** is the text language we will use to describe the circuit.
- **RTL** means register-transfer level. It describes hardware behavior around registers and clock cycles.
- **Simulation** runs the Verilog so we can check the circuit's behavior.
- **Synthesis** turns RTL into a netlist made from standard cells such as gates and flip-flops.
- **A PDK** is the process design kit. It provides design rules, timing data, and cell libraries for a manufacturing process.
- **OpenLane** places the cells, routes wires, checks the result, and writes the layout files.

## Create the project

Start in `~/bASICs/work`, the writable workspace in the VM. Put the Verilog source in `src`; the tools will write outputs under `runs`.

```bash
cd ~/bASICs/work
mkdir -p adder2/src
cd adder2
```

- `cd ~/bASICs/work` moves into the writable workspace.
- `mkdir -p adder2/src` creates the project folder and the `src` folder for source files.
- `cd adder2` moves into the project folder.

## Write the RTL

The RTL is the hardware design. This one has two 2-bit inputs, a 3-bit output, a reset, and a clocked register named `sum`.

Create `src/adder2.v` in your editor.

The design will be a module named `adder2`. It has a clock, an active-low reset, two 2-bit inputs named `a` and `b`, and a 3-bit registered output named `sum`.

Type the RTL below into your file and read the comments as you go.

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

A testbench is Verilog used only for simulation. It drives inputs into your design, waits for clock edges, and checks the outputs.

Create `src/adder2_tb.v`.

This testbench resets the design, tries two input pairs, stops if an output is wrong, and writes a waveform named `adder2.vcd`.

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

Simulation checks the RTL behavior before you run the slower physical-design flow.

Run a lint check first:

```bash
verilator --lint-only src/adder2.v
```

- `verilator` is the lint tool.
- `--lint-only` checks the Verilog without building or running a simulator.
- `src/adder2.v` is the RTL file to check.

Compile and run the testbench:

```bash
iverilog -g2012 -o adder2_tb src/adder2.v src/adder2_tb.v
vvp adder2_tb
```

- `iverilog` compiles the RTL and testbench into a simulation program.
- `-g2012` enables SystemVerilog 2012 syntax support.
- `-o adder2_tb` names the compiled simulation output.
- `src/adder2.v` is the design.
- `src/adder2_tb.v` is the testbench.
- `vvp adder2_tb` runs the compiled simulation.

The simulation writes `adder2.vcd`. Open it when you want to inspect the clock, reset, inputs, and registered output:

```bash
gtkwave adder2.vcd
```

- `gtkwave` opens waveform files.
- `adder2.vcd` contains the signal history written by the testbench.

## Synthesize RTL

Synthesis turns the RTL into connected hardware cells. Yosys reads the Verilog, chooses gates and flip-flops, and writes a synthesized Verilog netlist.

Ask Yosys to read your Verilog, synthesize the `adder2` top module, and write the synthesized netlist:

```bash
mkdir -p runs
yosys -p "read_verilog src/adder2.v; synth -top adder2; write_verilog runs/adder2.synth.v"
```

- `mkdir -p runs` creates the output folder if it does not already exist.
- `yosys` runs the synthesis tool.
- `-p` passes a short Yosys script on the command line.
- `read_verilog src/adder2.v` loads the RTL.
- `synth -top adder2` synthesizes the module named `adder2`.
- `write_verilog runs/adder2.synth.v` writes the synthesized netlist.

The synthesized Verilog is written to `runs/adder2.synth.v`.

## Pick the PDK

A chip layout depends on the manufacturing process. The PDK contains the metal layers, spacing rules, standard cells, timing data, and tool setup. This VM includes SKY130A.

Use the SKY130A PDK that is already installed in the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
```

- `echo "$PDK_ROOT"` prints the PDK install location.
- `test -d "$PDK_ROOT/sky130A"` checks that the SKY130A PDK directory exists.

## Add Timing Constraints

OpenLane needs a clock period for timing checks. A 10 ns clock period means a 100 MHz clock.

Create `src/impl.sdc`:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

- `create_clock` defines a clock for timing analysis.
- `[get_ports clk]` attaches the clock to the top-level port named `clk`.
- `-name clk` names the clock.
- `-period 10` sets the period to 10 ns.

Create `src/signoff.sdc` with the same line:

```tcl
create_clock [get_ports clk] -name clk -period 10
```

These files tell OpenLane that `clk` has a 10 ns period.

- `impl.sdc` is used during place and route.
- `signoff.sdc` is used during final timing checks.

## Add Pin Order

The layout needs physical pins around the edge of the block. This file puts the clock and reset on one side and the data signals on another.

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

- `#N` starts the north-side pin list.
- `clk` and `rst_n` are placed on the north side.
- `#S` starts the south-side pin list.
- `a.*`, `b.*`, and `sum.*` match every bit in each bus, such as `a[0]` and `a[1]`.

## Write OpenLane Config

The OpenLane config names the top module, points at the RTL and constraint files, chooses the clock, sets simple floorplan options, and selects the SKY130 standard-cell library.

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
- `VERILOG_FILES` points at the RTL file. `dir::` means the path is relative to this config file.
- `CLOCK_PORT` names the clock signal.
- `CLOCK_PERIOD` gives the clock period in ns.
- `PNR_SDC_FILE` and `SIGNOFF_SDC_FILE` point at the timing constraints.
- `FP_PIN_ORDER_CFG` points at the pin placement file.
- `FP_CORE_UTIL` sets the target percentage of the core area used by cells.
- `PL_TARGET_DENSITY_PCT` sets the target placement density.
- `FP_PDN_*` settings describe the power grid offsets, wire widths, and stripe spacing.
- `FP_PDN_SKIPTRIM: true` keeps the generated power grid simple for this small design.
- `pdk::sky130*` applies the settings below it only when the selected PDK matches `sky130*`.
- `STD_CELL_LIBRARY` selects the SKY130 standard-cell library.

## Run OpenLane

Now run the physical implementation flow. OpenLane will synthesize the design, create a floorplan, place cells, route wires, run checks, and write final outputs.

```bash
openlane --manual-pdk --pdk sky130A --pdk-root "$PDK_ROOT" config.yaml
```

- `openlane` runs the RTL-to-GDS flow.
- `--manual-pdk` tells OpenLane to use the PDK path you provide.
- `--pdk sky130A` selects the SKY130A process variant.
- `--pdk-root "$PDK_ROOT"` points to the PDK root directory.
- `config.yaml` is the project configuration file.

The run can take several minutes. Near the end, a passing run prints `Flow complete`.

## Check the Output

GDS is the final layout format. It contains geometry on manufacturing layers, not Verilog behavior.

Go to the OpenLane runs folder and list the run directories:

```bash
cd runs
ls
```

- `cd runs` enters the folder where OpenLane writes each run.
- `ls` lists the OpenLane run directories.
- Each run directory is named with a timestamp.

Change into the run directory that OpenLane just created. Type `cd `, then the directory name you see from `ls`.

```bash
cd RUN...
```

Look at the final layout outputs and check that the GDS exists:

```bash
tree final -L 1
test -s final/gds/adder2.gds
```

- `tree final -L 1` lists the top level of the final output directory.
- `test -s final/gds/adder2.gds` checks that the GDS file exists and is not empty.

Open the final GDS:

```bash
klayout final/klayout_gds/adder2.klayout.gds
```

- `klayout` opens the layout viewer.
- `adder2.klayout.gds` is the final GDS written in the path KLayout expects.
