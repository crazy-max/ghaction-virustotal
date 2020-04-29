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

  describe('asset', () => {
    it('derives asset info from a path', async () => {
      const {name, mime, size, file} = asset('tests/data/foo/bar.txt');
      expect(name).toEqual('bar.txt');
      expect(mime).toEqual('text/plain');
      expect(size).toEqual(7);
      expect(file.toString()).toEqual('scan me');
    });
  });

  describe('upload', () => {
    it('uploads asset on VirusTotal', async () => {
      let vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY);
      await vt.upload('tests/data/foo/bar.txt').then(response => {
        expect(response.status).toEqual(200);
        expect(response.data.data.id).not.toBeUndefined();
      });
    }, 30000);
  });

  describe('analysis', () => {
    it('returns analysis info from VirusTotal', async () => {
      let vt: VirusTotal = new VirusTotal(process.env.VT_API_KEY);
      await vt.upload('tests/data/foo/bar.txt').then(upres => {
        expect(upres.status).toEqual(200);
        expect(upres.data.data.id).not.toBeUndefined();
        vt.analysis(upres.data.data.id).then(anres => {
          expect(anres.status).toEqual(200);
          expect(anres.data.meta.file_info.sha256).toEqual(
            'cdf614b868c95c1367f3407bc43f9d74f10dfc0a96b2117808eb68569d6bb568'
          );
        });
      });
    }, 30000);
  });
});
