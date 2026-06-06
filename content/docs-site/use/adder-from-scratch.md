# Adder From Scratch

This guide creates a small 2-bit registered adder, simulates it, synthesizes it, picks SKY130, and runs OpenLane to GDS.

## Create the project

```bash
cd ~/bASICs/work
mkdir -p adder2/src
cd adder2
```

## Write the RTL

```bash
cat > src/adder2.v <<'EOF'
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
EOF
```

## Write a testbench

```bash
cat > src/adder2_tb.v <<'EOF'
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
EOF
```

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

## Pick the PDK

Use the SKY130A PDK already installed in the VM:

```bash
echo "$PDK_ROOT"
test -d "$PDK_ROOT/sky130A"
```

## Add timing constraints

```bash
cat > src/impl.sdc <<'EOF'
create_clock [get_ports clk] -name clk -period 10
EOF

cat > src/signoff.sdc <<'EOF'
create_clock [get_ports clk] -name clk -period 10
EOF
```

## Add pin order

```bash
cat > pin_order.cfg <<'EOF'
#N
clk
rst_n

#S
a.*
b.*
sum.*
EOF
```

## Write the OpenLane config

```bash
cat > config.yaml <<'EOF'
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
EOF
```

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
