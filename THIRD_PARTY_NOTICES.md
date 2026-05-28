# Third-Party Notices

This repository is licensed under the MIT License unless a file or directory
states otherwise. Released VM images and generated build outputs include
third-party software, data, and templates that remain under their own licenses.

## Repository Content

| Component | Location | License | Citation |
| --- | --- | --- | --- |
| bASICs VM assets | `assets/` | MIT | `assets/LICENSE` |
| PicoRV32 example core | `content/examples/picorv32a-sky130/src/picorv32a.v` | ISC-style permissive license | In-file notice; upstream project: https://github.com/YosysHQ/picorv32 |
| VitePress docs dependencies | `content/docs-site/package-lock.json` | MIT, ISC, BSD-2-Clause, BSD-3-Clause, and CC0-1.0 packages | Lockfile `license` fields |

## Fetched Build Inputs

These inputs are fetched by Nix during builds and may be included in local build
outputs or VM images.

| Component | Source | License | Citation |
| --- | --- | --- | --- |
| SKY130 PDK data | Volare release assets for `sky130` commit `0fe599b2afb6708d281543108caf8310912f54af` in `nix/pdks.nix` | Apache-2.0 | https://foss-eda-tools.googlesource.com/skywater-pdk/+/refs/heads/main/README.rst |
| OpenLane 2 | `github:efabless/openlane2` in `flake.nix` / `flake.lock` | Apache-2.0 | https://github.com/efabless/openlane2 |
| TinyTapeout support tools | `TinyTapeout/tt-support-tools` at `d2ed4b10ae588d01fc7c41b54582075dbd2924c1` in `nix/templates.nix` | Apache-2.0 | https://github.com/TinyTapeout/tt-support-tools/blob/d2ed4b10ae588d01fc7c41b54582075dbd2924c1/LICENSE |
| ChipFoundry Caravel user project template | `chipfoundry/caravel_user_project` at `b510613cec367828966b37583f9090ac5ddb6491` in `nix/templates.nix` | Apache-2.0 | https://github.com/chipfoundry/caravel_user_project/blob/b510613cec367828966b37583f9090ac5ddb6491/LICENSE |
| ChipFoundry OpenFrame user project template | `chipfoundry/openframe_user_project` at `ca732a645568d89efc9db3052eadeca47c60cf4d` in `nix/templates.nix` | Apache-2.0 | https://github.com/chipfoundry/openframe_user_project/blob/ca732a645568d89efc9db3052eadeca47c60cf4d/LICENSE |

## VM Images

The VM images produced by this repository include NixOS system packages and EDA
tools. Those packages are redistributed under their own upstream licenses, which
may include GPL, LGPL, MPL, Apache-2.0, MIT, BSD, ISC, and other free software
licenses. The MIT License for this repository does not relicense those
third-party packages, PDK data, or templates.
