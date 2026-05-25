{ buildPythonPackage
, fetchPypi
}:

buildPythonPackage rec {
  pname = "yowasp-runtime";
  version = "1.93";
  format = "wheel";

  src = fetchPypi {
    pname = "yowasp_runtime";
    inherit version format;
    dist = "py3";
    python = "py3";
    hash = "sha256-WwlyV3ETPXDoBmebtThloToPyIh+HEoIWspJfb/P+ws=";
  };

  doCheck = false;
}
