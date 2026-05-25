{ basicsContent, fetchFromGitHub, stdenvNoCC }:

let
  ttSupportTools = fetchFromGitHub {
    owner = "TinyTapeout";
    repo = "tt-support-tools";
    rev = "d2ed4b10ae588d01fc7c41b54582075dbd2924c1";
    hash = "sha256-b3yy44ChOHwDxqgjgBCj1ECqRFWYxHpjZwMBA8VcehE=";
  };

  caravelUserProject = fetchFromGitHub {
    owner = "chipfoundry";
    repo = "caravel_user_project";
    rev = "b510613cec367828966b37583f9090ac5ddb6491";
    hash = "sha256-qlSAD4fBqzgfLUDq07InHCduCYAwHZPQs+2h6reDLNU=";
  };

  openframeUserProject = fetchFromGitHub {
    owner = "chipfoundry";
    repo = "openframe_user_project";
    rev = "ca732a645568d89efc9db3052eadeca47c60cf4d";
    hash = "sha256-nyvRYjmGzKvZNVa7cyGV4TlSSRrNI614yeSqo+isI2I=";
  };
in
stdenvNoCC.mkDerivation {
  pname = "basics-templates";
  version = "0.1.0";

  dontUnpack = true;
  dontBuild = true;

  installPhase = ''
    runHook preInstall

    mkdir -p "$out/share/basics/templates"
    cp -R ${basicsContent}/templates/. "$out/share/basics/templates/"

    mkdir -p "$out/share/basics/templates/reference-upstream"
    cp -R ${ttSupportTools} "$out/share/basics/templates/reference-upstream/tt-support-tools"
    cp -R ${caravelUserProject} "$out/share/basics/templates/reference-upstream/caravel_user_project"
    cp -R ${openframeUserProject} "$out/share/basics/templates/reference-upstream/openframe_user_project"

    find "$out/share/basics/templates" -type d -exec chmod 0755 {} +
    find "$out/share/basics/templates" -type f -exec chmod 0644 {} +

    runHook postInstall
  '';
}
