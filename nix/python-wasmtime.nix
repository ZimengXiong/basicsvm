{ autoPatchelfHook
, buildPythonPackage
, fetchPypi
, lib
, stdenv
}:

buildPythonPackage rec {
  pname = "wasmtime";
  version = "44.0.0";
  format = "wheel";

  src =
    if stdenv.hostPlatform.system == "x86_64-linux" then
      fetchPypi {
        inherit pname version format;
        dist = "py3";
        python = "py3";
        platform = "manylinux1_x86_64";
        hash = "sha256-+NW70jS7mfnpTihPume16Jnd6+LUvnOE94OWvdTOJ6Y=";
      }
    else if stdenv.hostPlatform.system == "aarch64-linux" then
      fetchPypi {
        inherit pname version format;
        dist = "py3";
        python = "py3";
        platform = "manylinux2014_aarch64";
        hash = "sha256-5oZkS83f7IkJXJ/ZgrCEirXklOzoZVFyFKY0MLLtCPg=";
      }
    else
      throw "wasmtime wheel is not pinned for ${stdenv.hostPlatform.system}";

  nativeBuildInputs = [ autoPatchelfHook ];

  doCheck = false;

  meta = {
    platforms = [ "x86_64-linux" "aarch64-linux" ];
    license = lib.licenses.asl20;
  };
}
