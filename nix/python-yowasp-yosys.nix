{ buildPythonPackage
, fetchPypi
, wasmtime
, yowaspRuntime
}:

buildPythonPackage rec {
  pname = "yowasp-yosys";
  version = "0.65.0.0.post1154";
  format = "wheel";

  src = fetchPypi {
    pname = "yowasp_yosys";
    inherit version format;
    dist = "py3";
    python = "py3";
    hash = "sha256-oM/SlmaqNBK4xXfixH0nHD71tIDLSKB7RtrCWnx22NE=";
  };

  propagatedBuildInputs = [
    wasmtime
    yowaspRuntime
  ];

  doCheck = false;
}
