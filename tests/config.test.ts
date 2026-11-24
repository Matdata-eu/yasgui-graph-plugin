import { mergeConfig, getDefaultConfig, DEFAULT_LABEL_PREDICATES } from '../src/config';

describe('mergeConfig', () => {
  it('returns the defaults without input', () => {
    expect(mergeConfig()).toEqual(getDefaultConfig());
    expect(mergeConfig().labelPredicates).toEqual(DEFAULT_LABEL_PREDICATES);
  });

  it('merges predicate icons per predicate, later parts win', () => {
    const config = mergeConfig(
      { predicateIcons: { 'http://example.org/a': 'A', 'http://example.org/b': 'B' } },
      { predicateIcons: { 'http://example.org/b': 'b2' } }
    );
    expect(config.predicateIcons).toEqual({ 'http://example.org/a': 'A', 'http://example.org/b': 'b2' });
  });

  it('replaces the label predicates as a whole', () => {
    const config = mergeConfig({ labelPredicates: ['http://purl.org/dc/terms/title', ''] });
    expect(config.labelPredicates).toEqual(['http://purl.org/dc/terms/title']);
  });

  it('ignores invalid parts', () => {
    expect(mergeConfig(null, undefined, 'x' as any)).toEqual(getDefaultConfig());
  });

  it('does not share the defaults between calls', () => {
    const a = mergeConfig();
    a.labelPredicates.push('http://example.org/x');
    expect(mergeConfig().labelPredicates).toEqual(DEFAULT_LABEL_PREDICATES);
  });
});
