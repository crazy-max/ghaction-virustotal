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

  it('uploads asset on VirusTotal', async () => {
    let vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY || '');
    await vt.files('tests/data/foo/bar.txt').then(upload => {
      expect(upload.id).not.toBeUndefined();
      expect(upload.url).not.toBeUndefined();
    });
  }, 30000);

  it('uploads asset on VirusTotal Monitor', async () => {
    let vt: VirusTotal = new VirusTotal(process.env.VT_MONITOR_API_KEY || '');
    await vt.monitorItems('tests/data/foo/bar.txt', '/test').then(upload => {
      expect(upload.id).not.toBeUndefined();
      expect(upload.url).not.toBeUndefined();
    });
  }, 30000);

  it('returns analysis info from VirusTotal', async () => {
    let vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY || '');
    await vt.files('tests/data/foo/bar.txt').then(upload => {
      expect(upload.id).not.toBeUndefined();
      expect(upload.url).not.toBeUndefined();
      vt.analyses(upload.id).then(analysis => {
        expect(analysis.sha256).toEqual('cdf614b868c95c1367f3407bc43f9d74f10dfc0a96b2117808eb68569d6bb568');
      });
    });
  }, 30000);
});
