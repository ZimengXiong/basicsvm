# Release Images

This section is for people packaging VM images and preparing release artifacts.

## Common commands

```bash
./scripts/dev-shell
./scripts/build-vm x86_64
./scripts/run-vm x86_64
./scripts/preview-vm --rebuild
./scripts/verify-source
```

## Release image packaging

```bash
./scripts/package-vm macos-apple-silicon
./scripts/package-vm macos-intel
./scripts/package-vm windows-x86
./scripts/package-vm windows-arm
./scripts/package-vm linux-x86
./scripts/package-vm linux-arm
```

## Target matrix

| Target | Architecture | Primary output | Student host |
| --- | --- | --- | --- |
| `macos-apple-silicon` | `aarch64-linux` | zipped UTM bundle | Apple Silicon Mac |
| `macos-intel` | `x86_64-linux` | zipped UTM bundle | Intel Mac |
| `windows-x86` | `x86_64-linux` | VirtualBox OVA | Windows on Intel or AMD |
| `windows-arm` | `aarch64-linux` | VirtualBox OVA | Windows on ARM |
| `linux-x86` | `x86_64-linux` | VirtualBox OVA | Linux on Intel or AMD |
| `linux-arm` | `aarch64-linux` | QEMU QCOW2 | Linux on ARM |

Linux ARM is provided as a QEMU disk image rather than a VirtualBox appliance.

For full release batches:

```bash
./scripts/build-release local
./scripts/build-release x86
BASICS_ARM_BUILDER=xzm@xzm.local ./scripts/build-release arm
./scripts/finalize-release
```

## Validation before publishing

Run:

```bash
./scripts/nix flake check
./scripts/verify-source
./scripts/verify-fresh
```

Then boot or import the release artifact for the target host and run the SKY130 counter example from [First Flow](../use/first-flow.md).

## Publish checklist

Before publishing release artifacts:

1. Confirm artifact names match the platform install pages.
2. Boot one x86 target and one ARM target.
3. Confirm login credentials from `/etc/basics-release`.
4. Run `openlane --pdk-root "$PDK_ROOT" --manual-pdk --pdk sky130A config.yaml` from a copied `sky130-counter`.
5. Open the hosted docs from the desktop shortcut.
