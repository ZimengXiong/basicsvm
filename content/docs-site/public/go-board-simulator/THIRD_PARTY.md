# Third-party browser toolchains

The simulator vendors these open-source WebAssembly toolchains so compilation
and execution stay entirely client-side:

- YoWASP Yosys `0.65.176-dev.1145` — ISC license —
  <https://github.com/YoWASP/yowasp-yosys>
- YoWASP Clang/LLD `22.0.0-git20542-10` — Apache-2.0 with LLVM exceptions —
  <https://github.com/YoWASP/yowasp-clang>
- Yosys CXXRTL runtime headers — ISC license —
  <https://github.com/YosysHQ/yosys/tree/main/backends/cxxrtl/runtime>
- VeriSim / Icarus Verilog 14 WebAssembly compatibility fallback — GPL-2.0 —
  <https://github.com/senolgulgonul/verisim>

The generated design-specific WebAssembly model is created transiently in the
browser and is not uploaded or persisted by the application.
