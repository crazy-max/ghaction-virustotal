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

  it('resolves files given a set of paths', async () => {
    expect(util.resolvePaths(['tests/data/**/*'])).toEqual(['tests/data/foo/bar.txt']);
  });

  it('loads context for this action', async () => {
    process.env.GITHUB_REPOSITORY = 'crazy-max/ghaction-virustotal';
    const context: util.Context = util.loadContext(process.env);
    expect(context.github_owner).toEqual('crazy-max');
    expect(context.github_repo).toEqual('ghaction-virustotal');
  });

  it('loads context for this action', async () => {
    process.env.GITHUB_REPOSITORY = 'crazy-max/ghaction-virustotal';
    const context: util.Context = util.loadContext(process.env);
    expect(context.github_owner).toEqual('crazy-max');
    expect(context.github_repo).toEqual('ghaction-virustotal');
  });
});
