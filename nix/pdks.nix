{ fetchurl
, gnutar
, stdenvNoCC
, zstd
}:

let
  sky130Commit = "0fe599b2afb6708d281543108caf8310912f54af";

  volareAsset = { pdk, commit, name, hash }:
    fetchurl {
      url = "https://github.com/chipfoundry/volare/releases/download/${pdk}-${commit}/${name}.tar.zst";
      inherit hash;
    };

  sky130Assets = [
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "common"; hash = "sha256-lw1nHSj/zE3Mm8nCLV7TkkxOwwh1H6hTaxlestYMMgk="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_io"; hash = "sha256-IJ3BLIN1uphGVxO9hSANt24APaV4wrVPo74u34sYQII="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_pr"; hash = "sha256-wc7ipsHED7ncZSz9v5F6He4Z4Y7gcfrYWkHFK+/Vt6Y="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hd"; hash = "sha256-BhLp2PW6sKnUT8Qp4xkgMC70g7PngyY5/CNEKXA4QBM="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hdll"; hash = "sha256-EMqHKVVjhJs1RzvPA0smy5u7T5ZXc0zLC1N6L8b2ynQ="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hvl"; hash = "sha256-a/1LRx1wZVLN11A98yPteAS2fj/YdrZJ+agU0/ZTxus="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_ml_xx_hd"; hash = "sha256-4XpEPtzCIObjLRf2meFD+HDXXfrJXASQT7rcro1u06I="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_sram_macros"; hash = "sha256-WxQsqOUW8TaTxG+62+z8bd5LjaSfkoy+QJlzWLBzw2Y="; })
  ];
in
stdenvNoCC.mkDerivation {
  pname = "basics-pdks";
  version = "0.1.0";

  dontUnpack = true;
  dontBuild = true;

  nativeBuildInputs = [
    gnutar
    zstd
  ];

  installPhase = ''
    runHook preInstall

    pdk_root="$out/share/basics/pdks"
    sky130_version="$pdk_root/volare/sky130/versions/${sky130Commit}"

    mkdir -p "$sky130_version"

    for asset in ${builtins.concatStringsSep " " sky130Assets}; do
      tar --use-compress-program=unzstd -xf "$asset" -C "$sky130_version"
    done

    rm -rf "$sky130_version/sky130B"
    find "$sky130_version/sky130A/libs.ref" -mindepth 1 -maxdepth 1 \
      ! -name sky130_fd_sc_hd \
      ! -name sky130_fd_sc_hdll \
      ! -name sky130_fd_sc_hvl \
      ! -name sky130_fd_io \
      ! -name sky130_ml_xx_hd \
      ! -name sky130_fd_pr \
      ! -name sky130_sram_macros \
      -exec rm -rf {} +

    ln -s versions/${sky130Commit} "$pdk_root/volare/sky130/current"

    ln -s volare/sky130/versions/${sky130Commit}/sky130A "$pdk_root/sky130A"

    runHook postInstall
  '';
}
