# Add VSCodium to version 1.0

Version 1.1 already has VSCodium. This page lets you add it to a version 1.0
VM. You can also see [Versions](./versions.md).


> [!NOTE]
> You can use the inbuilt [nano](https://www.nano-editor.org/) editor instead:
> ```bash
> nano adder2.v
> ```

## Downloading VSCodium
Open up a terminal from the desktop and run the following command:
```bash
nix profile install nixpkgs#vscodium --extra-experimental-features flakes --extra-experimental-features nix-command
```
This will install the VSCodium editor onto the virtual machine.

## Accessing the file
Run the following command to view the directory where it was installed:
```bash
ls -d /nix/store/*vscodium*
```

You should see two file directories, both starting with **/nix/store**. Cd to the directory that **does not** end with **.drv**.

From that directory, cd to **./share/applications**, and run the following
```bash
xdg-open .
```
This will open the file explorer in the current directory.

## Opening VSCodium
Drag the **codium.desktop** to the desktop, and double click it to open the editor.
