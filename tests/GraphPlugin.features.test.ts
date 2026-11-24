/**
 * @jest-environment jsdom
 */

/**
 * GraphPlugin: group nodes (#28), label property setting (#42) and integrator configuration (#41, #42).
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
    remove(ids: any[] | any) {
      (Array.isArray(ids) ? ids : [ids]).forEach((id) => this.items.delete(id));
    }
    clear() {
      this.items.clear();
    }
    getIds() {
      return Array.from(this.items.keys());
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
    getPositions(ids: any[] = []) {
      const result: Record<string, { x: number; y: number }> = {};
      ids.forEach((id) => (result[id] = { x: 100, y: 50 }));
      return result;
    }
  }
  return { DataSet, Network };
});

import GraphPlugin from '../src/GraphPlugin';
import { getDefaultConfig } from '../src/config';
import { saveSettings, DEFAULT_SETTINGS } from '../src/settings';

class MockResizeObserver {
  observe() {}
  disconnect() {}
}
(global as any).ResizeObserver = MockResizeObserver;

const EX = 'http://example.org/';
const SKOS_PREF = 'http://www.w3.org/2004/02/skos/core#prefLabel';

function memberBindings(n: number) {
  return Array.from({ length: n }, (_, i) => ({
    subject: { value: `${EX}line`, type: 'uri' },
    predicate: { value: `${EX}hasSection`, type: 'uri' },
    object: { value: `${EX}section${i}`, type: 'uri' },
  }));
}

function makeYasr(bindings: any[], extra: Record<string, any> = {}) {
  const resultsEl = document.createElement('div');
  document.body.appendChild(resultsEl);
  return {
    results: { getBindings: () => bindings },
    resultsEl,
    getPrefixes: () => ({ ex: EX, skos: 'http://www.w3.org/2004/02/skos/core#' }),
    executeQuery: jest.fn().mockResolvedValue({ data: '' }),
    ...extra,
  } as any;
}

function lastNetwork() {
  return mockNetworks[mockNetworks.length - 1];
}

beforeEach(() => {
  document.body.innerHTML = '';
  localStorage.clear();
  mockNetworks.length = 0;
  GraphPlugin.defaults = getDefaultConfig();
  jest.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  jest.restoreAllMocks();
});

describe('group nodes', () => {
  it('draws a group node and shows its members on double-click without a query', () => {
    saveSettings({ ...DEFAULT_SETTINGS, groupThreshold: 5 });
    const yasr = makeYasr(memberBindings(6));
    const plugin: any = new GraphPlugin(yasr);
    plugin.draw();

    const group = plugin.nodesDataSet.get().find((n: any) => n.type === 'group');
    expect(group.label).toBe('6');
    expect(plugin.nodesDataSet.get()).toHaveLength(2);

    lastNetwork().emit('doubleClick', { nodes: [group.id], edges: [], event: { srcEvent: {} } });

    expect(yasr.executeQuery).not.toHaveBeenCalled();
    expect(plugin.nodesDataSet.get(group.id)).toBeUndefined();
    expect(plugin.nodesDataSet.get()).toHaveLength(7);
    expect(plugin.edgesDataSet.get()).toHaveLength(6);
    // Members start around the group's position
    const member = plugin.nodesDataSet.get().find((n: any) => n.fullValue === `${EX}section0`);
    expect(Math.abs(member.x - 100)).toBeLessThanOrEqual(60);
  });

  it('keeps expanded groups on a settings redraw and collapses them for new results', () => {
    saveSettings({ ...DEFAULT_SETTINGS, groupThreshold: 5 });
    const yasr = makeYasr(memberBindings(6));
    const plugin: any = new GraphPlugin(yasr);
    plugin.draw();
    const group = plugin.nodesDataSet.get().find((n: any) => n.type === 'group');
    lastNetwork().emit('doubleClick', { nodes: [group.id], edges: [], event: { srcEvent: {} } });

    plugin.keepViewState = true; // what a settings change does before redrawing
    plugin.draw();
    expect(plugin.nodesDataSet.get().some((n: any) => n.type === 'group')).toBe(false);

    plugin.draw(); // new results
    expect(plugin.nodesDataSet.get().some((n: any) => n.type === 'group')).toBe(true);
  });

  it('offers the grouping threshold in the settings panel', () => {
    const yasr = makeYasr(memberBindings(2));
    const plugin: any = new GraphPlugin(yasr);
    plugin.draw();
    (yasr.resultsEl.querySelector('.yasgui-graph-settings-button') as HTMLButtonElement).click();
    const selects = Array.from(yasr.resultsEl.querySelectorAll('.yasgui-graph-settings-panel select')) as HTMLSelectElement[];
    const grouping = selects.find((s) => Array.from(s.options).some((o) => o.textContent === 'Off'))!;
    expect(grouping.value).toBe('10');
    grouping.value = '0';
    grouping.dispatchEvent(new Event('change'));
    expect(JSON.parse(localStorage.getItem('yasgui-graph-plugin-settings')!).groupThreshold).toBe(0);
  });
});

describe('label property setting', () => {
  const bindings = [
    { subject: { value: `${EX}a`, type: 'uri' }, predicate: { value: SKOS_PREF, type: 'uri' }, object: { value: 'Alpha', type: 'literal' } },
    { subject: { value: `${EX}a`, type: 'uri' }, predicate: { value: `${EX}code`, type: 'uri' }, object: { value: 'A1', type: 'literal' } },
    { subject: { value: `${EX}a`, type: 'uri' }, predicate: { value: `${EX}next`, type: 'uri' }, object: { value: `${EX}b`, type: 'uri' } },
  ];

  it('lists only the predicates with literal values in the data and applies the choice', () => {
    const yasr = makeYasr(bindings);
    const plugin: any = new GraphPlugin(yasr);
    plugin.draw();
    expect(plugin.nodesDataSet.get().find((n: any) => n.fullValue === `${EX}a`).label).toBe('Alpha');

    (yasr.resultsEl.querySelector('.yasgui-graph-settings-button') as HTMLButtonElement).click();
    const select = Array.from(yasr.resultsEl.querySelectorAll('.yasgui-graph-settings-panel select')).find((s) =>
      Array.from((s as HTMLSelectElement).options).some((o) => o.textContent === 'Automatic')
    ) as HTMLSelectElement;
    expect(Array.from(select.options).map((o) => o.textContent)).toEqual(['Automatic', 'ex:code', 'skos:prefLabel']);

    select.value = `${EX}code`;
    select.dispatchEvent(new Event('change'));
    expect(plugin.nodesDataSet.get().find((n: any) => n.fullValue === `${EX}a`).label).toBe('A1');
  });
});

describe('integrator configuration', () => {
  const bindings = [
    { subject: { value: `${EX}a`, type: 'uri' }, predicate: { value: `${EX}next`, type: 'uri' }, object: { value: `${EX}b`, type: 'uri' } },
    { subject: { value: `${EX}a`, type: 'uri' }, predicate: { value: `${EX}title`, type: 'uri' }, object: { value: 'Alpha', type: 'literal' } },
  ];

  it('reads GraphPlugin.defaults', () => {
    GraphPlugin.defaults.predicateIcons[`${EX}next`] = '→';
    GraphPlugin.defaults.labelPredicates = [`${EX}title`];
    const plugin: any = new GraphPlugin(makeYasr(bindings));
    plugin.draw();
    expect(plugin.edgesDataSet.get().find((e: any) => e.predicate === `${EX}next`).label).toBe('→');
    expect(plugin.nodesDataSet.get().find((n: any) => n.fullValue === `${EX}a`).label).toBe('Alpha');
  });

  it('reads staticConfig under the name the plugin was registered with', () => {
    const yasr = makeYasr(bindings, {
      config: { plugins: { MyGraph: { staticConfig: { predicateIcons: { [`${EX}next`]: 'nx' } } } } },
    });
    const plugin: any = new GraphPlugin(yasr);
    yasr.plugins = { MyGraph: plugin };
    plugin.draw();
    expect(plugin.edgesDataSet.get().find((e: any) => e.predicate === `${EX}next`).label).toBe('nx');
  });
});
