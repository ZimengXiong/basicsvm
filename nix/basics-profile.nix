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
    gdstk
    gitpython
    (ps.callPackage ./python-klayout.nix { })
    numpy
    platformdirs
    pillow
    pytest
    python-frontmatter
    pyyaml
    requests
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
  docsPython = pkgs.python3.withPackages (ps: [ ps.mistune ]);
  basicsDocsSite = pkgs.stdenvNoCC.mkDerivation {
    pname = "basics-docs-site";
    version = "0.1.0";
    src = basicsContent + "/docs-site";
    nativeBuildInputs = [ docsPython ];

    installPhase = ''
      runHook preInstall
      mkdir -p "$out/share/basics/docs-site"
      python - "$out/share/basics/docs-site" <<'PY'
import html
import pathlib
import shutil
import sys

import mistune

out = pathlib.Path(sys.argv[1])
src = pathlib.Path.cwd()
markdown = mistune.create_markdown()

pages = [
    pathlib.Path("index.md"),
    pathlib.Path("start/first-boot.md"),
    pathlib.Path("use/index.md"),
    pathlib.Path("use/first-flow.md"),
    pathlib.Path("install/mac-apple-silicon.md"),
    pathlib.Path("install/mac-intel.md"),
    pathlib.Path("install/windows-x86.md"),
    pathlib.Path("install/windows-arm.md"),
    pathlib.Path("install/linux-x86.md"),
    pathlib.Path("install/linux-arm.md"),
    pathlib.Path("build/index.md"),
    pathlib.Path("build/local-nix.md"),
    pathlib.Path("build/docs.md"),
    pathlib.Path("help/index.md"),
    pathlib.Path("help/openlane.md"),
    pathlib.Path("using/pdk-locations.md"),
    pathlib.Path("using/filesystem-layout.md"),
    pathlib.Path("reference/tools.md"),
    pathlib.Path("advanced/check-environment.md"),
    pathlib.Path("advanced/reproduce-vm.md"),
    pathlib.Path("advanced/bare-nix.md"),
]

def title_for(path, text):
    for line in text.splitlines():
        if line.startswith("# "):
            return line[2:].strip()
    return path.with_suffix("").as_posix()

page_titles = {}
for page in pages:
    page_titles[page] = title_for(page, (src / page).read_text())

def href_for(page):
    if page.name == "index.md":
        return "index.html"
    return page.with_suffix(".html").as_posix()

nav = "\n".join(
    f'<a href="{html.escape(href_for(page))}">{html.escape(page_titles[page])}</a>'
    for page in pages
)

style = """
:root {
  color-scheme: light;
  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  color: #111;
  background: #fff;
}
body {
  margin: 0;
}
.layout {
  display: grid;
  grid-template-columns: minmax(14rem, 18rem) minmax(0, 1fr);
  min-height: 100vh;
}
nav {
  border-right: 1px solid #ddd;
  padding: 1rem;
  background: #f7f7f7;
}
nav strong {
  display: block;
  margin: 0 0 1rem;
}
nav a {
  display: block;
  color: #111;
  text-decoration: none;
  padding: 0.35rem 0;
}
main {
  max-width: 70rem;
  padding: 2rem 2.5rem 4rem;
}
pre {
  overflow-x: auto;
  background: #f2f2f2;
  padding: 1rem;
}
code {
  background: #f2f2f2;
  padding: 0.1rem 0.25rem;
}
pre code {
  padding: 0;
}
table {
  border-collapse: collapse;
  width: 100%;
}
th, td {
  border: 1px solid #ddd;
  padding: 0.5rem;
  text-align: left;
}
@media (max-width: 760px) {
  .layout {
    display: block;
  }
  nav {
    border-right: 0;
    border-bottom: 1px solid #ddd;
  }
  main {
    padding: 1rem;
  }
}
"""

for page in pages:
    text = (src / page).read_text()
    body = markdown(text)
    dest = out / href_for(page)
    dest.parent.mkdir(parents=True, exist_ok=True)
    dest.write_text(f"""<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>{html.escape(page_titles[page])} - bASICs VM</title>
  <style>{style}</style>
</head>
<body>
  <div class="layout">
    <nav>
      <strong>bASICs VM</strong>
      {nav}
    </nav>
    <main>{body}</main>
  </div>
</body>
</html>
""")

public = src / "public"
if public.exists():
    shutil.copytree(public, out, dirs_exist_ok=True)
PY
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
    vim
    nano
    tree
    blender

    openlane2.packages.${system}.openlane
    openlane2.packages.${system}.openroad
    openlane2.packages.${system}.opensta
    openlane2.packages.${system}.openroad-abc
    yosys
    magic-vlsi
    netgen
    klayout
    verilator
    (pkgs.iverilog or pkgs.verilog)
  ];
in
{
  inherit pkgs basicsContent basicsAssets basicsTools basicsExamples basicsTemplates basicsPdks basicsDocsSite;

  profile = pkgs.symlinkJoin {
    name = "basics-profile-${system}";
    paths = basicsTools;
  };
}
