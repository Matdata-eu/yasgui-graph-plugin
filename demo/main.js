import { createYasr, setupThemeToggle, showResults } from './demo-host.js';

const datasets = window.mockDatasets;

/** What the picker offers, with a hint on what to try */
const CHOICES = [
  {
    key: 'iconsAndImages',
    label: 'Icons and images',
    hint: 'Nodes with schema:icon or schema:image show that icon or picture, also through their rdf:type.',
  },
  {
    key: 'expansion',
    label: 'Node expansion',
    hint: 'Double-click Alice or Bob to fetch their DESCRIBE triples and grow the graph. <kbd>Ctrl</kbd>+click a node to open it in the describe panel.',
  },
  {
    key: 'grouping',
    label: 'Grouped objects',
    hint: 'The 14 platforms of one predicate collapse into a group node. Double-click it to show them, or change the threshold in the settings.',
  },
  {
    key: 'skos',
    label: 'SKOS labels in several languages',
    hint: 'Node labels come from skos:prefLabel in your browser language. Open the settings and pick another "Label from", such as skos:notation.',
  },
  { key: 'social', label: 'Social network', hint: 'Five people and who they know.' },
  { key: 'ontology', label: 'Ontology structure', hint: 'Classes and properties of a small ontology.' },
  { key: 'blankNodes', label: 'Blank nodes', hint: 'Addresses as blank nodes, drawn in grey.' },
  { key: 'multiEdges', label: 'Multiple edges', hint: 'Several predicates between the same two nodes.' },
  { key: 'inheritanceTest', label: 'Icons from the type', hint: 'Icons and images inherited from rdf:type, in five cases.' },
  { key: 'overrideTest', label: 'Own icon over the type icon', hint: 'A resource icon wins over the icon of its type.' },
  { key: 'multipleTypesTest', label: 'Several types', hint: 'Resources with more than one rdf:type: the first type with an image wins.' },
  { key: 'large', label: 'Large graph (50 nodes)', hint: 'Physics layout of a larger graph.' },
  { key: 'longStrings', label: 'Long values', hint: 'Long literals and predicate names are cut with an ellipsis; hover for the full text.' },
  { key: 'specialChars', label: 'Special characters', hint: 'Unicode and escaped characters in IRIs and literals.' },
  { key: 'basic', label: 'Basic graph', hint: 'Two people with a few properties.' },
].filter((choice) => datasets[choice.key]);

/** Load the plugin from source while developing, from the build when deployed */
async function loadPlugin() {
  if (import.meta.env?.DEV) {
    const module = await import('@matdata/yasgui-graph-plugin');
    return module.default;
  }
  const css = document.createElement('link');
  css.rel = 'stylesheet';
  css.href = './dist/yasgui-graph-plugin.min.css';
  document.head.appendChild(css);
  await new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = './dist/yasgui-graph-plugin.min.js';
    script.onload = resolve;
    script.onerror = () => reject(new Error('Could not load dist/yasgui-graph-plugin.min.js'));
    document.head.appendChild(script);
  });
  // The browser bundle exposes its exports on this global
  return window.TablePlugin?.default;
}

const GraphPlugin = await loadPlugin();
// MatGUI registers its own copy as "Graph"; this page shows the one from this repository
window.Yasgui.Yasr.registerPlugin('Graph', GraphPlugin);

setupThemeToggle(document.getElementById('theme-toggle'));

const params = new URLSearchParams(window.location.search);
let current = datasets[params.get('dataset')] ? params.get('dataset') : CHOICES[0].key;

const yasr = createYasr(document.getElementById('yasr'), {
  plugin: 'Graph',
  getPrefixes: () => datasets[current].prefixes || {},
  // Background queries see the results plus the rest of the mock knowledge graph
  getTriples: () => [...datasets[current].results.bindings, ...(window.mockKnowledgeGraph || [])],
});

const select = document.getElementById('dataset');
const hint = document.getElementById('dataset-hint');
for (const choice of CHOICES) {
  const option = document.createElement('option');
  option.value = choice.key;
  option.textContent = `${choice.label} (${datasets[choice.key].results.bindings.length} triples)`;
  select.appendChild(option);
}

function load(key) {
  current = key;
  select.value = key;
  hint.innerHTML = CHOICES.find((choice) => choice.key === key)?.hint || '';
  yasr.closeDescribe?.();
  showResults(yasr, datasets[key]);
  const url = new URL(window.location.href);
  url.searchParams.set('dataset', key);
  window.history.replaceState(null, '', url);
}

select.addEventListener('change', () => load(select.value));
load(current);

window.yasr = yasr;
