DESIGN = counter

.PHONY: all check-workdir check-tools synth gds clean

all: check-workdir check-tools gds

check-workdir:
	@case "$$(pwd -P)" in \
		/home/beaver/bASICs/examples/*|/home/beaver/bASICs/templates/*|/opt/basics/examples/*|/opt/basics/templates/*) \
			echo "You are running in the packaged example/template directory."; \
			echo "Copy this project into /home/beaver/bASICs/work/ and run make from the copy."; \
			exit 1; \
			;; \
	esac

check-tools:
	command -v yosys
	command -v openlane
	command -v openroad
	test -n "$$PDK_ROOT"
	test -d "$$PDK_ROOT/gf180mcuD"

synth: check-workdir
	mkdir -p runs
	yosys -p "read_verilog src/counter.v; synth -top $(DESIGN); write_verilog runs/$(DESIGN).synth.v"

gds: check-workdir
	openlane --manual-pdk --pdk gf180mcuD --scl gf180mcu_fd_sc_mcu7t5v0 --pdk-root "$$PDK_ROOT" config.yaml
	test -n "$$(find runs -path '*final/gds/*.gds' -print -quit)"

clean:
	rm -rf runs
