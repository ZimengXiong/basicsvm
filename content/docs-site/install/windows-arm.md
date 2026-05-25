# Install on Windows ARM

Windows ARM support depends on the virtualization stack available on your machine. Prefer an ARM Linux VM when possible. Use QEMU or a UTM-like frontend if your host supports it.

## Host target

| Host | Recommended direction | VM architecture |
| --- | --- | --- |
| Windows on ARM | QEMU or UTM-like frontend | `aarch64-linux` |

## Guidance

1. Prefer the bASICs `aarch64` VM image when available.
2. Use a VM frontend that can run ARM Linux guests on your host.
3. Allocate at least 8 GB RAM, 4 CPU cores, and 64 GB disk.
4. Forward ports `22`, `5901`, and `6080` if you need host access.
5. Boot the VM and log in as `beaver` with password `works`.

## If ARM virtualization is blocked

Use a different host, a remote Linux machine, or rebuild/run the environment with bare Nix on a supported `aarch64-linux` or `x86_64-linux` system. The VM flake defines both architectures.
