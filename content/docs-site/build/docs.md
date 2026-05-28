# Work on the Docs

The docs source lives in `content/docs-site`.

## Preview locally

```bash
cd content/docs-site
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build the VitePress site

```bash
cd content/docs-site
npm run build
```

## Bundled VM docs

The VM packages docs through the `basics-docs-site` derivation. That derivation currently renders selected Markdown pages into simple static HTML for offline use inside the VM.

After adding or renaming docs pages, update the page list in `nix/basics-profile.nix` so offline docs include the same content.

## Check both docs surfaces

Run the VitePress build:

```bash
cd content/docs-site
npm run build
```

Then build the offline docs derivation:

```bash
cd ../..
./scripts/nix build .#basics-docs-site -o out/result-docs
```

Open the generated offline page:

```bash
xdg-open out/result-docs/share/basics/docs-site/index.html
```

## Docs writing rules

- Put user tasks before reference material.
- Keep install pages specific to one host family.
- Show exact commands and expected paths.
- Use the tool names and commands users will type in the VM.
- Keep bASICs-specific behavior limited to VM layout, packaging, and pinned paths.
