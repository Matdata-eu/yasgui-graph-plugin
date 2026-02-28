import { getDefaultNetworkOptions } from '../src/networkConfig';
import type { ThemeColors } from '../src/types';
import { DEFAULT_SETTINGS } from '../src/settings';

const themeColors: ThemeColors = {
  blankNode: '#888888',
  literal: '#a6c8a6ff',
  typeObject: '#e15b13ff',
  uri: '#97C2FC',
  background: '#ffffff',
  text: '#000000',
  edge: '#cccccc',
  edgeLabel: '#666666',
  edgeLabelBackground: 'rgba(255,255,255,0.8)',
};

describe('getDefaultNetworkOptions', () => {
  it('returns a defined options object', () => {
    expect(getDefaultNetworkOptions(themeColors)).toBeDefined();
  });

  it('enables physics with sensible defaults', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.physics.enabled).toBe(true);
    expect(options.physics.stabilization.enabled).toBe(true);
    expect(options.physics.stabilization.iterations).toBeGreaterThan(0);
  });

  it('enables all interaction modes', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.interaction.dragNodes).toBe(true);
    expect(options.interaction.dragView).toBe(true);
    expect(options.interaction.zoomView).toBe(true);
    expect(options.interaction.hover).toBe(true);
  });

  it('applies the theme text color to node font', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.nodes.font.color).toBe(themeColors.text);
  });

  it('applies the theme edge color to edge lines', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.edges.color.color).toBe(themeColors.edge);
  });

  it('applies the theme edgeLabel color and background to edge font', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.edges.font.color).toBe(themeColors.edgeLabel);
    expect(options.edges.font.background).toBe(themeColors.edgeLabelBackground);
  });

  it('sets arrows direction to "to" via edge arrows config', () => {
    const options = getDefaultNetworkOptions(themeColors);
    expect(options.edges.arrows.to.enabled).toBe(true);
  });

  it('produces different node font colors for different themes', () => {
    const darkThemeColors: ThemeColors = { ...themeColors, text: '#e0e0e0' };
    const lightOptions = getDefaultNetworkOptions(themeColors);
    const darkOptions = getDefaultNetworkOptions(darkThemeColors);
    expect(lightOptions.nodes.font.color).not.toBe(darkOptions.nodes.font.color);
  });

  it('disables smooth edges when edgeStyle is "straight"', () => {
    const options = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, edgeStyle: 'straight' });
    expect(options.edges.smooth.enabled).toBe(false);
  });

  it('enables smooth edges when edgeStyle is "curved"', () => {
    const options = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, edgeStyle: 'curved' });
    expect(options.edges.smooth.enabled).toBe(true);
  });

  it('disables physics when physicsEnabled is false', () => {
    const options = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, physicsEnabled: false });
    expect(options.physics.enabled).toBe(false);
  });

  it('sets font size to 0 when showNodeLabels is false', () => {
    const options = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, showNodeLabels: false });
    expect(options.nodes.font.size).toBe(0);
  });

  it('sets a larger node size when nodeSize is "large"', () => {
    const mediumOptions = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, nodeSize: 'medium' });
    const largeOptions = getDefaultNetworkOptions(themeColors, { ...DEFAULT_SETTINGS, nodeSize: 'large' });
    expect(largeOptions.nodes.size).toBeGreaterThan(mediumOptions.nodes.size);
  });
});
