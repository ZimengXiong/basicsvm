# Build a Nandland Go Board image inside the bASICs VM.
# Examples: make                 # blink.bin
#           make TOP=counter     # counter.bin
TOP ?= blink
PCF := go_board.pcf

.PHONY: all clean

all: $(TOP).bin

%.json: %.v
	yosys -p 'read_verilog $<; synth_ice40 -top $* -json $@'

%.asc: %.json $(PCF)
	nextpnr-ice40 --hx1k --package vq100 --freq 25 --pcf $(PCF) --json $< --asc $@

%.bin: %.asc
	icepack $< $@

clean:
	rm -f *.json *.asc *.bin
