# Install Troubleshooting

## Image architecture mismatch

Check the host CPU family and selected target:

| Host | Expected VM architecture |
| --- | --- |
| Apple Silicon Mac | `aarch64-linux` |
| Intel Mac | `x86_64-linux` |
| Windows Intel or AMD | `x86_64-linux` |
| Windows ARM | `aarch64-linux` |
| Linux Intel or AMD | `x86_64-linux` |

If the VM app rejects the image or boots to an architecture error, go back to [Start Here](../start/index.md) and choose the page that matches your computer.

## Not enough resources

Make sure your computer has at least 30 GB of free storage for the VM download and import. OpenLane runs can fail or stall when memory is too low.

## Virtualization disabled

On Intel or AMD hosts, enable hardware virtualization in BIOS or firmware settings if the VM app reports that virtualization is unavailable.

## Downloaded the wrong file

Use the install page that matches the computer:

| Computer | Page |
| --- | --- |
| Mac with Apple Silicon | [macOS Apple Silicon](../install/mac-apple-silicon.md) |
| Mac with Intel | [macOS Intel](../install/mac-intel.md) |
| Windows with Intel or AMD | [Windows x86](../install/windows-x86.md) |
| Windows with ARM | [Windows ARM](../install/windows-arm.md) |
| Linux with Intel or AMD | [Linux x86](../install/linux-x86.md) |
