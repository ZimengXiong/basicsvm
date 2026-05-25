{ fetchurl
, gnutar
, stdenvNoCC
, zstd
}:

let
  sky130Commit = "0fe599b2afb6708d281543108caf8310912f54af";
  gf180mcuCommit = "c6d73a35f524070e85faff4a6a9eef49553ebc2b";

  volareAsset = { pdk, commit, name, hash }:
    fetchurl {
      url = "https://github.com/chipfoundry/volare/releases/download/${pdk}-${commit}/${name}.tar.zst";
      inherit hash;
    };

  sky130Assets = [
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "common"; hash = "sha256-lw1nHSj/zE3Mm8nCLV7TkkxOwwh1H6hTaxlestYMMgk="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_io"; hash = "sha256-IJ3BLIN1uphGVxO9hSANt24APaV4wrVPo74u34sYQII="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_pr"; hash = "sha256-wc7ipsHED7ncZSz9v5F6He4Z4Y7gcfrYWkHFK+/Vt6Y="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_pr_reram"; hash = "sha256-3OBnTTD4OblOZn0n1e3b9QsLv/TKMVw9jTP217wSfnU="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hd"; hash = "sha256-BhLp2PW6sKnUT8Qp4xkgMC70g7PngyY5/CNEKXA4QBM="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hdll"; hash = "sha256-EMqHKVVjhJs1RzvPA0smy5u7T5ZXc0zLC1N6L8b2ynQ="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hs"; hash = "sha256-WX4x7eYgx1cjQJKbX57mSbs2/a1PEW61h1GjLOWF3tA="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_hvl"; hash = "sha256-a/1LRx1wZVLN11A98yPteAS2fj/YdrZJ+agU0/ZTxus="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_lp"; hash = "sha256-QBmNDs6w5EPlo+MSaYyu4aCpM1EA9apLKFb0l8v7yP4="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_ls"; hash = "sha256-83sKTw/M465cjQcdYnzXh9Zjl3ETKfD8EdyTKUC5F7k="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_fd_sc_ms"; hash = "sha256-rXWMU9KIFpBzs1Au66ebnEzDPMd9DfKl+w3fts4ApIo="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_ml_xx_hd"; hash = "sha256-4XpEPtzCIObjLRf2meFD+HDXXfrJXASQT7rcro1u06I="; })
    (volareAsset { pdk = "sky130"; commit = sky130Commit; name = "sky130_sram_macros"; hash = "sha256-WxQsqOUW8TaTxG+62+z8bd5LjaSfkoy+QJlzWLBzw2Y="; })
  ];

  gf180mcuAssets = [
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "common"; hash = "sha256-lLYahv4CgPudtWjYU+Pygw80RXkYfMzBr3KMokBEoSU="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_fd_io"; hash = "sha256-RMqfvZhKvfAQmvjQ6b0v4RMbZEXAtACDOgJNowP3rso="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_fd_ip_sram"; hash = "sha256-1h9oCzi6ZN9Qa9gauXD+4HzDmfJC/W3VzeNZmXZ4cg8="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_fd_pr"; hash = "sha256-uTBmLsMIvz5mUH6KvN1mpvtU05m0LaP2YD756ZT0avI="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_fd_sc_mcu7t5v0"; hash = "sha256-iuxlZpAdgDJSYj/k5JaA1iA7GpT5nOpWSp5WgUvBCtA="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_fd_sc_mcu9t5v0"; hash = "sha256-yuupJt2lreql5rq1JhBuoBPL8vEE1HDtjoTjVk0ZvDk="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_osu_sc_gp12t3v3"; hash = "sha256-oE7NWGc/A+fY/pm4QmEbq/j7GPLjQ7cY74r59CfWV54="; })
    (volareAsset { pdk = "gf180mcu"; commit = gf180mcuCommit; name = "gf180mcu_osu_sc_gp9t3v3"; hash = "sha256-mBuycx9BgvSiK1bvtme7l2dThEkWQXA74TvCUlmnCuI="; })
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
    gf180mcu_version="$pdk_root/volare/gf180mcu/versions/${gf180mcuCommit}"

    mkdir -p "$sky130_version" "$gf180mcu_version"

    for asset in ${builtins.concatStringsSep " " sky130Assets}; do
      tar --use-compress-program=unzstd -xf "$asset" -C "$sky130_version"
    done

    for asset in ${builtins.concatStringsSep " " gf180mcuAssets}; do
      tar --use-compress-program=unzstd -xf "$asset" -C "$gf180mcu_version"
    done

    ln -s versions/${sky130Commit} "$pdk_root/volare/sky130/current"
    ln -s versions/${gf180mcuCommit} "$pdk_root/volare/gf180mcu/current"

    ln -s volare/sky130/versions/${sky130Commit}/sky130A "$pdk_root/sky130A"
    ln -s volare/sky130/versions/${sky130Commit}/sky130B "$pdk_root/sky130B"

    ln -s volare/gf180mcu/versions/${gf180mcuCommit}/gf180mcuA "$pdk_root/gf180mcuA"
    ln -s volare/gf180mcu/versions/${gf180mcuCommit}/gf180mcuB "$pdk_root/gf180mcuB"
    ln -s volare/gf180mcu/versions/${gf180mcuCommit}/gf180mcuC "$pdk_root/gf180mcuC"
    ln -s volare/gf180mcu/versions/${gf180mcuCommit}/gf180mcuD "$pdk_root/gf180mcuD"

    runHook postInstall
  '';
}
