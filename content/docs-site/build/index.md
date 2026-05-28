# Build from Source

Use this page when you are rebuilding the VM from the repository or preparing release images for students.

The project is a Nix flake, but you should use the scripts in this repository instead of calling Nix directly. They use the repo-local `nix-portable` setup and keep build output under `out`.

## Prerequisites

These builds need enough local storage, CPU, and memory to keep the VM image and PDK builds moving.

| Requirement | What to use |
| --- | --- |
| Builder OS | NixOS or another Linux host that can run the repo scripts |
| Free storage | At least 600 GB for VM images, PDK closures, and intermediate output |
| CPU and memory | At least 12 CPU cores and 32 GB RAM |
| Build time | About 6 to 10 minutes per release build |
| ARM releases | A native ARM Linux builder |

## Get the source

```bash
git clone https://github.com/ZimengXiong/basicsvm.git
cd basicsvm
```

## Build a local VM

For a local x86_64 VM build:

```bash
scripts/build-vm x86_64
```

On an ARM builder:

```bash
scripts/build-vm aarch64
```

The result links are written under `out`:

```text
out/result-vm-x86_64
out/result-vm-aarch64
```

## Package release images

Use the target for the student platform you are publishing:

```bash
scripts/package-vm macos-apple-silicon
scripts/package-vm macos-intel
scripts/package-vm windows-x86
scripts/package-vm windows-arm
scripts/package-vm linux-x86
```

Linux ARM is not a supported student release target.

| Target | Architecture | Output | Student host |
| --- | --- | --- | --- |
| `macos-apple-silicon` | `aarch64-linux` | zipped UTM bundle and QCOW2 | Apple Silicon Mac |
| `macos-intel` | `x86_64-linux` | zipped UTM bundle and QCOW2 | Intel Mac |
| `windows-x86` | `x86_64-linux` | VirtualBox OVA | Windows on Intel or AMD |
| `windows-arm` | `aarch64-linux` | VirtualBox VDI | Windows on ARM |
| `linux-x86` | `x86_64-linux` | VirtualBox OVA or QCOW2 | Linux on Intel or AMD |

For a full release batch:

```bash
scripts/build-release local
scripts/build-release x86
BASICS_ARM_BUILDER=xzm@xzm.local scripts/build-release arm
scripts/finalize-release
```

## Verify the build

Before publishing, run the checks:

```bash
scripts/nix flake check
scripts/verify-source
scripts/verify-fresh
```

`verify-fresh` rebuilds the profile, templates, and PDK packages. It also checks that the expected tools, Python imports, PDK links, and packaged templates are present.

After the scripted checks pass, boot or import at least one x86 release and one ARM release. In each VM, run the SKY130 counter flow from [First Flow](../use/first-flow.md).
