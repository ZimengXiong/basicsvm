{ pkgs
, system
, openlane2
, basicsContent
}:

let
  yowaspRuntime = pkgs.python3Packages.callPackage ./python-yowasp-runtime.nix { };
  wasmtime = pkgs.python3Packages.callPackage ./python-wasmtime.nix { };
  yowaspYosys = pkgs.python3Packages.callPackage ./python-yowasp-yosys.nix {
    inherit wasmtime yowaspRuntime;
  };
  basicsAssets = pkgs.callPackage ../assets/nix/package.nix { };
  basicsPython = pkgs.python3.withPackages (ps: with ps; [
    cairosvg
    chevron
    configupdater
    gdstk
    gitpython
    (ps.callPackage ./python-klayout.nix { })
    matplotlib
    mistune
    numpy
    platformdirs
    pillow
    pytest
    python-frontmatter
    pyserial
    pyyaml
    requests
    virtualenv
    yowaspYosys
  ]);
  basicsTemplates = pkgs.callPackage ./templates.nix {
    inherit basicsContent;
  };
  basicsExamples = pkgs.stdenvNoCC.mkDerivation {
    pname = "basics-examples";
    version = "0.1.0";
    dontUnpack = true;
    dontBuild = true;
    installPhase = ''
      runHook preInstall
      mkdir -p "$out/share/basics/examples"
      cp -R ${basicsContent}/examples/. "$out/share/basics/examples/"
      find "$out/share/basics/examples" -type d -exec chmod 0755 {} +
      find "$out/share/basics/examples" -type f -exec chmod 0644 {} +
      runHook postInstall
    '';
  };
  basicsPdks = pkgs.callPackage ./pdks.nix { };
  basicsDocsSite = pkgs.stdenvNoCC.mkDerivation {
    pname = "basics-docs-site";
    version = "0.1.0";
    src = "${basicsContent}/docs-site";
    dontBuild = true;
    installPhase = ''
      runHook preInstall
      mkdir -p "$out/share/basics/docs-site"
      cp -R . "$out/share/basics/docs-site/source"
      cat > "$out/share/basics/docs-site/index.html" <<'EOF'
<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>bASICs VM Docs</title>
  <style>
    body { font-family: sans-serif; margin: 2rem; max-width: 60rem; line-height: 1.5; }
    code { background: #f2f2f2; padding: 0.1rem 0.25rem; }
  </style>
</head>
<body>
  <h1>bASICs VM Docs</h1>
  <p>The full documentation source is bundled in <code>source/</code>. Public hosted docs are built outside the VM release path.</p>
  <ul>
    <li><a href="source/index.md">Overview</a></li>
    <li><a href="source/getting-started.md">Getting Started</a></li>
    <li><a href="source/reference/tools.md">Tools Inventory</a></li>
    <li><a href="source/advanced/reproduce-vm.md">Reproduce the VM</a></li>
  </ul>
</body>
</html>
EOF
      runHook postInstall
    '';
  };
  basicsTools = with pkgs; [
    basicsPython
    git
    gnumake
    jq
    rsync
    curl
    pre-commit
    vim
    nano
    tree

    openlane2.packages.${system}.openlane
    openlane2.packages.${system}.openroad
    openlane2.packages.${system}.opensta
    openlane2.packages.${system}.openroad-abc
    yosys
    magic-vlsi
    netgen
    ngspice
    klayout
    verilator
    (pkgs.iverilog or pkgs.verilog)
    gtkwave
    xschem
    volare
    graphviz
    xdot
    (pkgs.sby or pkgs.symbiyosys)
    z3
    yices
    boolector
    bitwuzla
    surelog
    uhdm
    ciel
    cvc5
  ];
in
{
  inherit pkgs basicsContent basicsAssets basicsTools basicsExamples basicsTemplates basicsPdks basicsDocsSite;

  profile = pkgs.symlinkJoin {
    name = "basics-profile-${system}";
    paths = basicsTools;
  };
}
