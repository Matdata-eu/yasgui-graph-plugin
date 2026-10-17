/**
 * @jest-environment jsdom
 */
import { getThemeNodeColors } from '../src/themeUtils';

afterEach(() => {
  document.documentElement.removeAttribute('style');
});

describe('getThemeNodeColors data colour roles', () => {
  it('falls back to MatData brand, ink and amber in light mode', () => {
    const c = getThemeNodeColors('light');
    expect(c.uri).toBe('#0563bb');
    expect(c.literal).toBe('#1c2633');
    expect(c.highlight).toBe('#f2b300');
  });

  it('falls back to dark-mode brand, ink and amber', () => {
    const c = getThemeNodeColors('dark');
    expect(c.uri).toBe('#5aa8f2');
    expect(c.literal).toBe('#eef1ef');
    expect(c.highlight).toBe('#f5c242');
  });

  it('reads the yasgui tokens when present', () => {
    document.documentElement.style.setProperty('--yasgui-brand', '#123456');
    document.documentElement.style.setProperty('--yasgui-highlight', '#abcdef');
    const c = getThemeNodeColors('light');
    expect(c.uri).toBe('#123456');
    expect(c.highlight).toBe('#abcdef');
  });

  it('keeps the plugin --yasgui-graph-* variables as overrides', () => {
    document.documentElement.style.setProperty('--yasgui-brand', '#123456');
    document.documentElement.style.setProperty('--yasgui-graph-uri', '#97c2fc');
    document.documentElement.style.setProperty('--yasgui-graph-literal', '#a6c8a6');
    const c = getThemeNodeColors('light');
    expect(c.uri).toBe('#97c2fc');
    expect(c.literal).toBe('#a6c8a6');
  });
});
