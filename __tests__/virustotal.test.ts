import {describe, expect, it} from '@jest/globals';
import {mimeOrDefault, asset, VirusTotal} from '../src/virustotal';

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
    const {name, mime, size, file} = asset('tests/data/foo/bar.txt');
    expect(name).toEqual('bar.txt');
    expect(mime).toEqual('text/plain');
    expect(size).toEqual(7);
    expect(file.toString()).toEqual('scan me');
  });

  (process.env.VT_API_KEY ? it : it.skip)(
    'uploads asset on VirusTotal',
    async () => {
      const vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY);
      await vt.files('tests/data/foo/bar.txt').then(upload => {
        // eslint-disable-next-line jest/no-standalone-expect
        expect(upload.id).not.toBeUndefined();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(upload.url).not.toBeUndefined();
      });
    },
    30000
  );

  (process.env.VT_MONITOR_API_KEY ? it : it.skip)(
    'uploads asset on VirusTotal Monitor',
    async () => {
      const vt: VirusTotal = new VirusTotal(process.env.VT_MONITOR_API_KEY);
      await vt.monitorItems('tests/data/foo/bar.txt', '/test').then(upload => {
        // eslint-disable-next-line jest/no-standalone-expect
        expect(upload.id).not.toBeUndefined();
        // eslint-disable-next-line jest/no-standalone-expect
        expect(upload.url).not.toBeUndefined();
      });
    },
    30000
  );
});
