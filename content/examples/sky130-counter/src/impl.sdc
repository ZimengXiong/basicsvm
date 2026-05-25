create_clock [get_ports clk] -name clk -period 10
set_input_delay 2 -clock clk [get_ports rst_n]
set_output_delay 2 -clock clk [get_ports count*]
