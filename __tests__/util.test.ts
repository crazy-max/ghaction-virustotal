import * as util from '../src/util';

describe('util', () => {
  describe('parseInputFiles', () => {
    it('parses empty strings', () => {
      expect(util.parseInputFiles('')).toEqual([]);
    });
    it('parses comma-delimited strings', () => {
      expect(util.parseInputFiles('foo,bar')).toEqual(['foo', 'bar']);
    });
    it('parses newline and comma-delimited (and then some)', () => {
      expect(util.parseInputFiles('foo,bar\nbaz,boom,\n\ndoom,loom ')).toEqual(['foo', 'bar', 'baz', 'boom', 'doom', 'loom']);
    });
  });

  describe('resolvePaths', () => {
    it('resolves files given a set of paths', async () => {
      expect(util.resolvePaths(['tests/data/**/*'])).toEqual(['tests/data/foo/bar.txt']);
    });
  });
});
