{ buildPythonPackage
, curl
, expat
, fetchPypi
, libpng
, zlib
}:

buildPythonPackage rec {
  pname = "klayout";
  version = "0.29.12";
  format = "setuptools";

  src = fetchPypi {
    inherit pname version;
    hash = "sha256-6eJpoxdrUuMBn78QTqvh8zfUH0B8YvWTQR28hZ7HLCY=";
  };

  buildInputs = [
    curl
    expat
    libpng
    zlib
  ];

  doCheck = false;
}
