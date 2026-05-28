# Work on the Docs

The docs source is in `content/docs-site`.

## Preview

```bash
cd content/docs-site
npm install
npm run dev
```

Open:

```text
http://localhost:5173/
```

## Build

```bash
cd content/docs-site
npm run build
```

## Bundled VM docs

The VM also includes offline docs. When you add, remove, or rename a page, update the page list in `nix/basics-profile.nix`, then rebuild the bundled docs:

```bash
cd basicsvm
./scripts/nix build .#basics-docs-site -o out/result-docs
```

The generated offline docs start here:

```bash
xdg-open out/result-docs/share/basics/docs-site/index.html
```
