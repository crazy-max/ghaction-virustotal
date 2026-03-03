import {describe, expect, it} from 'vitest';
import {randomBytes, randomUUID} from 'crypto';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import {mimeOrDefault, asset, VirusTotal} from '../src/virustotal.js';

const fixturesDir = path.join(__dirname, 'fixtures');

const createUniqueAssetFile = (): string => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'vt-upload-'));
  const filePath = path.join(dir, `${randomUUID()}.txt`);
  const content = `scan me ${randomUUID()} ${randomBytes(32).toString('hex')}\n`;
  fs.writeFileSync(filePath, content, 'utf8');
  return filePath;
};

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
      const uploadFile = createUniqueAssetFile();
      try {
        const upload = await vt.files(uploadFile);
        expect(upload.id).not.toBeUndefined();
        expect(upload.url).not.toBeUndefined();
      } finally {
        fs.rmSync(path.dirname(uploadFile), {recursive: true, force: true});
      }
    },
    30000
  );

  it.skipIf(!process.env.VT_MONITOR_API_KEY)(
    'uploads asset on VirusTotal Monitor',
    async () => {
      const vt: VirusTotal = new VirusTotal(process.env.VT_MONITOR_API_KEY);
      const uploadFile = createUniqueAssetFile();
      try {
        const upload = await vt.monitorItems(uploadFile, `/test/${randomUUID()}`);
        expect(upload.id).not.toBeUndefined();
        expect(upload.url).not.toBeUndefined();
      } finally {
        fs.rmSync(path.dirname(uploadFile), {recursive: true, force: true});
      }
    },
    30000
  );
});
