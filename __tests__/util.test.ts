import {parseInputFiles, resolvePaths} from '../src/util';
import * as assert from 'assert';

describe('util', () => {
  describe('parseInputFiles', () => {
    it('parses empty strings', () => {
      assert.deepStrictEqual(parseInputFiles(''), []);
    });
    it('parses comma-delimited strings', () => {
      assert.deepStrictEqual(parseInputFiles('foo,bar'), ['foo', 'bar']);
    });
    it('parses newline and comma-delimited (and then some)', () => {
      assert.deepStrictEqual(parseInputFiles('foo,bar\nbaz,boom,\n\ndoom,loom '), ['foo', 'bar', 'baz', 'boom', 'doom', 'loom']);
    });
  });

  describe('resolvePaths', () => {
    it('resolves files given a set of paths', async () => {
      assert.deepStrictEqual(resolvePaths(['tests/data/**/*']), ['tests/data/foo/bar.txt']);
    });
  });
});
