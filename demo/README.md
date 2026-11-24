# Graph plugin demo

`index.html` shows the graph view the way it is in MatGUI: MatGUI's own results
pane (Yasr from `@matdata/yasgui`, loaded from jsDelivr) with only the Graph
plugin, and a picker of sample CONSTRUCT results. Because it runs in MatGUI's
results pane, the page has what MatGUI gives a plugin:

- the plugin toolbar above the graph (edges, edge labels, compact, zoom to fit, view settings);
- the shared describe panel: <kbd>Ctrl</kbd>+click (<kbd>Cmd</kbd>+click on macOS) a node;
- background queries for node expansion: double-click a node;
- the MatData look and the light and dark theme (the theme button sets `data-theme` on `<html>`, as MatGUI does).

There is no SPARQL endpoint. The describe panel and node expansion are answered
from the triples of the picked dataset plus `window.mockKnowledgeGraph`
(see `demo-host.js`).

## Files

| File | What it holds |
| --- | --- |
| `index.html` | The page |
| `main.js` | Loads the plugin, the dataset picker |
| `demo-host.js` | Creates MatGUI's Yasr with only this plugin, the mock background queries, the theme switch |
| `demo.css` | Page chrome in MatGUI's design tokens |
| `mock-data.js` | The datasets (`window.mockDatasets`) and the extra triples for expansion |

## Running it

```bash
npm install
npm run dev
```

Open the URL Vite prints. In development the plugin is loaded from `src/`, so
changes show after a reload. `?dataset=<key>` opens a dataset directly, e.g.
`?dataset=expansion`.

The deployed demo is this folder with the plugin build copied to `demo/dist/`
(see the deploy workflow). To try that locally:

```bash
npm run build
mkdir -p demo/dist && cp -r dist/* demo/dist/
npx http-server demo
```

## Adding a dataset

Add an entry to `window.mockDatasets` in `mock-data.js` with
`head.vars = ['subject', 'predicate', 'object']`, the triples as SPARQL JSON
bindings and a `prefixes` map, then add it to `CHOICES` in `main.js` with a
label and a hint.
