import { getDefaultNetworkOptions } from '../src/networkConfig';
import type { ThemeColors } from '../src/types';

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
});
