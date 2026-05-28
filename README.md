# bASICs VM

bASICs VM is a prebuilt Linux desktop for the bASICs open silicon flow. It packages the EDA tools, SKY130 PDK, examples, templates, and documentation into VM images for macOS, Windows, and Linux.

![bASICs VM desktop](content/docs-site/public/images/desktop-auto-login.webp)

The student-facing docs live at [basics.alpacawebservices.com](https://basics.alpacawebservices.com). They cover picking the right VM image, opening the desktop, and running the first counter flow.

This repository is organized around building that VM from source. `flake.nix` is the main Nix entrypoint. The `nix/` directory defines the packaged tools, PDKs, templates, and docs. The `nixos/` directory defines the actual VM system: desktop setup, user account, filesystem layout, services, shortcuts, and environment variables.

The files under `content/` are what get placed into the VM for users. That includes the example projects, project templates, and the VitePress docs source in `content/docs-site`. The VM exposes those pieces through `/home/beaver/bASICs`, with writable work kept separate from packaged reference material.

The `assets/` directory holds the visual pieces used by the VM, including logos, wallpaper, and desktop-facing images. The docs site also has its own public assets under `content/docs-site/public`, including screenshots and demo videos.

The `scripts/` directory is the working interface for builders. The scripts wrap the repo-local Nix setup, build local VM images, package release artifacts, run validation checks, and prepare uploadable releases. Build output and local Nix state stay in ignored paths such as `out/` and `.nix-portable/`.

Release artifacts are published from this monorepo. The current docs site is also deployed from here through Vercel, while larger demo videos stay in the repository and are served through GitHub raw URLs.
