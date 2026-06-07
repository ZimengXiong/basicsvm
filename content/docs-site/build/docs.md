# Work on the Docs

The docs live in `content/docs-site`. This is a regular VitePress site.

## Get the source

```bash
git clone https://github.com/ZimengXiong/basicsvm.git
cd basicsvm
```

## Preview

Start the local docs server:

```bash
cd content/docs-site
npm install
npm run dev
```

Then open:

```text
http://localhost:5173/
```

## Build

Before pushing docs changes, make sure the static build still works:

```bash
cd content/docs-site
npm run build
```
