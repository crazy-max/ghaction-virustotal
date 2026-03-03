import {describe, expect, it} from 'vitest';
import * as path from 'path';

import {mimeOrDefault, asset, VirusTotal} from '../src/virustotal.js';

const fixturesDir = path.join(__dirname, 'fixtures');

describe('virustotal', () => {
  describe('mimeOrDefault', () => {
    it('returns a specific mime for common path', async () => {
      expect(mimeOrDefault('foo.tar.gz')).toEqual('application/gzip');
    });
    it('returns default mime for uncommon path', async () => {
      expect(mimeOrDefault('foo.uncommon')).toEqual('application/octet-stream');
    });
  });

  it('derives asset info from a path', async () => {
    const {name, mime, size, file} = asset(path.join(fixturesDir, 'data/foo/bar.txt'));
    expect(name).toEqual('bar.txt');
    expect(mime).toEqual('text/plain');
    expect(size).toEqual(7);
    expect(file.toString()).toEqual('scan me');
  });

  it.skipIf(!process.env.VT_API_KEY)(
    'uploads asset on VirusTotal',
    async () => {
      const vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY);
      const upload = await vt.files(path.join(fixturesDir, 'data/foo/bar.txt'));
      expect(upload.id).not.toBeUndefined();
      expect(upload.url).not.toBeUndefined();
    },
    30000
  );

  it.skipIf(!process.env.VT_MONITOR_API_KEY)(
    'uploads asset on VirusTotal Monitor',
    async () => {
      const vt: VirusTotal = new VirusTotal(process.env.VT_MONITOR_API_KEY);
      const upload = await vt.monitorItems(path.join(fixturesDir, 'data/foo/bar.txt'), '/test');
      expect(upload.id).not.toBeUndefined();
      expect(upload.url).not.toBeUndefined();
    },
    30000
  );
});
