# Install APIO

APIO is optional FPGA workflow software. The bASICs VM already includes the
underlying iCE40 tools (`yosys`, `nextpnr-ice40`, `icepack`, and `iceprog`), so
you only need APIO if you want its `apio build` and `apio upload` workflow.

APIO is not bundled with the VM. Installing it here affects only your user
account and does not change the rest of the VM.

## Install

Open a terminal in the VM and run:

```bash
python3 -m pip install --user apio
```

Close and reopen the terminal, then install APIO's optional tool packages:

```bash
apio install --all
```

Check that it worked:

```bash
apio --version
```

## Go Board

Attach the Go Board to the VM before using `apio upload`. See [Connecting USB
devices](/install/connecting-usb-devices) for the UTM and VirtualBox steps.

APIO can install its own copies of FPGA tools. That is expected, but it means
its tool versions may differ from the versions included with the VM. If you are
following a class example, use the commands specified by that example.

## Remove APIO

To remove APIO from your account:

```bash
python3 -m pip uninstall apio
```
