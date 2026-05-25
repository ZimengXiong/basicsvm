{ stdenvNoCC }:

stdenvNoCC.mkDerivation {
  pname = "basics-assets";
  version = "0.1.0";
  src = ../.;

  installPhase = ''
    runHook preInstall
    mkdir -p $out/share/basics/assets
    cp -R assets/* $out/share/basics/assets/
    runHook postInstall
  '';
}

