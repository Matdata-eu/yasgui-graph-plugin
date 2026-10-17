/**
 * @jest-environment jsdom
 */

/**
 * GraphPlugin integration with the yasr host API (shared describe panel and
 * plugin toolbar slot), and the fallback for yasr builds without it.
 * vis-network is mocked: jsdom has no canvas.
 */

type Handler = (params: any) => void;

const mockNetworks: any[] = [];

jest.mock('vis-network/standalone', () => {
  class DataSet {
    private items = new Map<any, any>();
    constructor(items: any[] = []) {
      this.add(items);
    }
    add(items: any[] | any) {
      (Array.isArray(items) ? items : [items]).forEach((i) => this.items.set(i.id, { ...i }));
    }
    update(items: any[] | any) {
      (Array.isArray(items) ? items : [items]).forEach((i) =>
        this.items.set(i.id, { ...(this.items.get(i.id) || {}), ...i })
      );
    }
    clear() {
      this.items.clear();
    }
    get(id?: any) {
      return id === undefined ? Array.from(this.items.values()) : this.items.get(id);
    }
  }
  class Network {
    handlers: Record<string, Handler[]> = {};
    body: any;
    fit = jest.fn();
    setOptions = jest.fn();
    destroy = jest.fn();
    constructor(container: HTMLElement, public data: any, public options: any) {
      this.body = { container };
      mockNetworks.push(this);
    }
    on(event: string, fn: Handler) {
      (this.handlers[event] = this.handlers[event] || []).push(fn);
    }
    emit(event: string, params: any) {
      (this.handlers[event] || []).forEach((fn) => fn(params));
    }
    getPositions() {
      return {};
    }
  }
  return { DataSet, Network };
});

import GraphPlugin from '../src/GraphPlugin';

class MockResizeObserver {
  observe() {}
  disconnect() {}
}
(global as any).ResizeObserver = MockResizeObserver;

const EX = 'http://example.org/';
const bindings = [
  {
    subject: { value: `${EX}alice`, type: 'uri' },
    predicate: { value: `${EX}knows`, type: 'uri' },
    object: { value: `${EX}bob`, type: 'uri' },
  },
  {
    subject: { value: `${EX}alice`, type: 'uri' },
    predicate: { value: `${EX}name`, type: 'uri' },
    object: { value: 'Alice', type: 'literal' },
  },
  {
    subject: { value: `${EX}alice`, type: 'uri' },
    predicate: { value: `${EX}address`, type: 'uri' },
    object: { value: '_:b0', type: 'bnode' },
  },
];

interface MockYasr {
  results: { getBindings: () => any[] };
  resultsEl: HTMLDivElement;
  executeQuery: jest.Mock;
  describe: jest.Mock;
  [key: string]: any;
}

function makeYasr(extra: Record<string, any> = {}): MockYasr {
  const resultsEl = document.createElement('div');
  document.body.appendChild(resultsEl);
  return {
    results: { getBindings: () => bindings },
    resultsEl,
    getPrefixes: () => ({ ex: EX }),
    executeQuery: jest.fn().mockResolvedValue({ data: '' }),
    ...extra,
  } as unknown as MockYasr;
}

function makeHostYasr(hostApi: Record<string, any> = { version: 1, describe: true, toolbar: true }) {
  const toolbar = document.createElement('div');
  toolbar.className = 'yasr_pluginToolbar';
  document.body.appendChild(toolbar);
  const yasr = makeYasr({
    hostApi,
    describe: jest.fn().mockResolvedValue(undefined),
    closeDescribe: jest.fn(),
    getPluginToolbar: jest.fn(() => toolbar),
  });
  return { yasr, toolbar };
}

function lastNetwork() {
  return mockNetworks[mockNetworks.length - 1];
}

function nodeIdFor(plugin: any, value: string): number {
  const node = plugin.nodesDataSet.get().find((n: any) => n.fullValue === value);
  if (!node) throw new Error(`no node for ${value}`);
  return node.id;
}

function click(nodeId: number, mods: Partial<MouseEvent> = {}, event = 'click') {
  lastNetwork().emit(event, { nodes: [nodeId], edges: [], event: { srcEvent: { ctrlKey: false, metaKey: false, ...mods } } });
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  mockNetworks.length = 0;
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('fallback: yasr without host API', () => {
  it('draws the floating controls with Lucide stroke icons', () => {
    const yasr = makeYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();

    const controls = yasr.resultsEl.querySelector('.yasgui-graph-controls');
    expect(controls).not.toBeNull();
    const buttons = Array.from(controls!.querySelectorAll('button'));
    expect(buttons.map((b) => b.textContent!.trim())).toEqual(['Zoom to fit', 'Settings']);
    buttons.forEach((b) => {
      const svg = b.querySelector('svg')!;
      expect(svg.getAttribute('stroke')).toBe('currentColor');
      expect(svg.getAttribute('fill')).toBe('none');
    });
    expect(yasr.resultsEl.querySelector('.yasr_toolbarButton')).toBeNull();
  });

  it('opens the settings panel from the floating settings button', () => {
    const yasr = makeYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const button = yasr.resultsEl.querySelector<HTMLButtonElement>('.yasgui-graph-settings-button')!;
    button.click();
    const panel = yasr.resultsEl.querySelector('.yasgui-graph-settings-panel');
    expect(panel).not.toBeNull();
    expect(panel!.classList.contains('yasgui-graph-settings-panel--docked')).toBe(false);
    expect(button.getAttribute('aria-expanded')).toBe('true');
    plugin.destroy();
  });

  it('Ctrl+click does nothing new and Ctrl+double-click still expands', () => {
    // A describe() method without hostApi must not be used
    const yasr = makeYasr({ describe: jest.fn() });
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const alice = nodeIdFor(plugin, `${EX}alice`);

    click(alice, { ctrlKey: true });
    click(alice, { metaKey: true });
    expect(yasr.describe).not.toHaveBeenCalled();

    click(alice, { ctrlKey: true }, 'doubleClick');
    expect(yasr.executeQuery).toHaveBeenCalledWith(`DESCRIBE <${EX}alice>`, expect.objectContaining({ acceptHeader: 'text/turtle' }));
  });

  it('getIcon returns a Lucide stroke icon', () => {
    const el = new GraphPlugin(makeYasr() as any).getIcon();
    const svg = el.querySelector('svg')!;
    expect(svg.getAttribute('stroke')).toBe('currentColor');
    expect(svg.getAttribute('fill')).toBe('none');
  });
});

describe('host API: plugin toolbar slot', () => {
  it('renders the controls into the toolbar slot instead of floating buttons', () => {
    const { yasr, toolbar } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();

    expect(yasr.resultsEl.querySelector('.yasgui-graph-controls')).toBeNull();
    expect(toolbar.querySelector('.yasr_toolbarGroup')).not.toBeNull();
    expect(toolbar.querySelectorAll('.yasr_toolbarSelect select').length).toBe(2);
    expect(toolbar.querySelector('[data-graph-control="zoomToFit"]')!.textContent).toBe('Zoom to fit');

    // View settings sits far right, after a spacer, with the sliders-horizontal icon
    const children = Array.from(toolbar.children);
    const last = children[children.length - 1] as HTMLElement;
    expect(children[children.length - 2].classList.contains('yasr_toolbarSpacer')).toBe(true);
    expect(last.classList.contains('yasr_toolbarButton')).toBe(true);
    expect(last.textContent).toBe('View settings');
    expect(last.querySelector('svg')!.getAttribute('stroke')).toBe('currentColor');
  });

  it('View settings opens a docked settings panel and marks the button active', () => {
    const { yasr, toolbar } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const button = toolbar.querySelector<HTMLButtonElement>('[data-graph-control="viewSettings"]')!;
    button.click();
    const panel = yasr.resultsEl.querySelector('.yasgui-graph-settings-panel')!;
    expect(panel.classList.contains('yasgui-graph-settings-panel--docked')).toBe(true);
    expect(button.classList.contains('is-active')).toBe(true);
    button.click();
    expect(yasr.resultsEl.querySelector('.yasgui-graph-settings-panel')).toBeNull();
    expect(button.getAttribute('aria-expanded')).toBe('false');
  });

  it('changing a toolbar select persists the setting and rebuilds the toolbar once', () => {
    const { yasr, toolbar } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const select = toolbar.querySelector<HTMLSelectElement>('select[data-graph-control="edgeStyle"]')!;
    select.value = 'straight';
    select.dispatchEvent(new Event('change'));

    expect(JSON.parse(localStorage.getItem('yasgui-graph-plugin-settings')!).edgeStyle).toBe('straight');
    expect(toolbar.querySelectorAll('.yasr_toolbarGroup').length).toBe(1);
    expect(toolbar.querySelectorAll('[data-graph-control="viewSettings"]').length).toBe(1);
    const rebuilt = toolbar.querySelector<HTMLSelectElement>('select[data-graph-control="edgeStyle"]')!;
    expect(rebuilt.value).toBe('straight');
    expect(document.activeElement).toBe(rebuilt);
  });

  it('compact toggle reflects its state with aria-pressed', () => {
    const { yasr, toolbar } = makeHostYasr();
    new GraphPlugin(yasr as any).draw();
    const compact = () => toolbar.querySelector<HTMLButtonElement>('[data-graph-control="compactMode"]')!;
    expect(compact().getAttribute('aria-pressed')).toBe('false');
    compact().click();
    expect(compact().getAttribute('aria-pressed')).toBe('true');
  });

  it('destroy removes its toolbar items', () => {
    const { yasr, toolbar } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    plugin.destroy();
    expect(toolbar.children.length).toBe(0);
  });

  it('falls back to floating controls when hostApi.toolbar is false', () => {
    const { yasr, toolbar } = makeHostYasr({ version: 1, describe: true, toolbar: false });
    new GraphPlugin(yasr as any).draw();
    expect(toolbar.children.length).toBe(0);
    expect(yasr.resultsEl.querySelector('.yasgui-graph-controls')).not.toBeNull();
  });
});

describe('host API: describe on Ctrl/Cmd+click', () => {
  it('Ctrl+click and Cmd+click on a resource node call yasr.describe with source Graph', () => {
    const { yasr } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    click(nodeIdFor(plugin, `${EX}alice`), { ctrlKey: true });
    click(nodeIdFor(plugin, `${EX}bob`), { metaKey: true });
    expect(yasr.describe).toHaveBeenNthCalledWith(1, `${EX}alice`, { source: 'Graph' });
    expect(yasr.describe).toHaveBeenNthCalledWith(2, `${EX}bob`, { source: 'Graph' });
  });

  it('plain click, literals and blank nodes do not describe', () => {
    const { yasr } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    click(nodeIdFor(plugin, `${EX}alice`));
    click(nodeIdFor(plugin, 'Alice'), { ctrlKey: true });
    const bnode = plugin['nodesDataSet'].get().find((n: any) => typeof n.uri === 'string' && n.uri.startsWith('_:'));
    expect(bnode).toBeDefined();
    click(bnode.id, { ctrlKey: true });
    lastNetwork().emit('click', { nodes: [], edges: [], event: { srcEvent: { ctrlKey: true } } });
    expect(yasr.describe).not.toHaveBeenCalled();
  });

  it('Ctrl+double-click describes once and does not expand; plain double-click still expands', () => {
    const { yasr } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const alice = nodeIdFor(plugin, `${EX}alice`);
    click(alice, { ctrlKey: true });
    click(alice, { ctrlKey: true });
    click(alice, { ctrlKey: true }, 'doubleClick');
    expect(yasr.describe).toHaveBeenCalledTimes(1);
    expect(yasr.executeQuery).not.toHaveBeenCalled();

    click(alice, {}, 'doubleClick');
    expect(yasr.executeQuery).toHaveBeenCalledTimes(1);
  });

  it('ignores yasr.describe when hostApi.describe is not advertised', () => {
    const { yasr } = makeHostYasr({ version: 1, describe: false, toolbar: true });
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    click(nodeIdFor(plugin, `${EX}alice`), { ctrlKey: true });
    expect(yasr.describe).not.toHaveBeenCalled();
  });

  it('adds the describe hint to resource tooltips only with the host API', () => {
    const { yasr } = makeHostYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const nodes = plugin['nodesDataSet'].get();
    expect(nodes.find((n: any) => n.fullValue === `${EX}alice`).title).toContain('+click to describe');
    expect(nodes.find((n: any) => n.fullValue === 'Alice').title).not.toContain('+click to describe');

    const plain = new GraphPlugin(makeYasr() as any);
    plain.draw();
    expect(plain['nodesDataSet'].get().some((n: any) => String(n.title).includes('+click to describe'))).toBe(false);
  });

  it('logs and survives a rejected describe', async () => {
    const { yasr } = makeHostYasr();
    const error = jest.spyOn(console, 'error').mockImplementation(() => {});
    yasr.describe.mockRejectedValueOnce(new Error('boom'));
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    click(nodeIdFor(plugin, `${EX}alice`), { ctrlKey: true });
    await Promise.resolve();
    await Promise.resolve();
    expect(error).toHaveBeenCalled();
  });
});

describe('data colour roles', () => {
  it('selected nodes use the highlight colour', () => {
    const yasr = makeYasr();
    const plugin = new GraphPlugin(yasr as any);
    plugin.draw();
    const alice = plugin['nodesDataSet'].get().find((n: any) => n.fullValue === `${EX}alice`);
    expect(alice.color.highlight.background).toBe('#f2b300');
    expect(alice.color.background).toBe('#0563bb');
    const literal = plugin['nodesDataSet'].get().find((n: any) => n.fullValue === 'Alice');
    expect(literal.color.background).toBe('#1c2633');
  });
});
