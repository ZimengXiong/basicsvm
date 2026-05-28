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
```

## Target matrix

| Target | Architecture | Primary output | Student host |
| --- | --- | --- | --- |
| `macos-apple-silicon` | `aarch64-linux` | zipped UTM bundle plus QCOW2 | Apple Silicon Mac |
| `macos-intel` | `x86_64-linux` | zipped UTM bundle plus QCOW2 | Intel Mac |
| `windows-x86` | `x86_64-linux` | VirtualBox OVA | Windows on Intel or AMD |
| `windows-arm` | `aarch64-linux` | VirtualBox VDI | Windows on ARM |
| `linux-x86` | `x86_64-linux` | VirtualBox OVA or QCOW2 | Linux on Intel or AMD |

Linux ARM is not a supported student release target.

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
4. Run `openlane --pdk-root "$PDK_ROOT" config.yaml` from a copied `sky130-counter`.
5. Open the bundled docs from the desktop shortcut.
