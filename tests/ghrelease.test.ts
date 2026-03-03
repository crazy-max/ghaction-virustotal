import {describe, expect, it} from 'vitest';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import * as github from '@actions/github';

import * as ghrelease from '../src/ghrelease.js';
import {asset} from '../src/virustotal.js';

const tmpDir = fs.mkdtempSync(path.join(process.env.TEMP || os.tmpdir(), 'ghrelease-'));
const octokit = github.getOctokit(process.env.GITHUB_TOKEN);

describe('github', () => {
  let release: ghrelease.Release;
  let assets: Array<ghrelease.ReleaseAsset>;

  it('returns a GitHub release', async () => {
    release = await ghrelease.getRelease(octokit, '1.20.110-71');
    expect(release).not.toBeUndefined();
    expect(release.id).toEqual(38769571);
  });

  it('returns a GitHub release assets list', async () => {
    if (!release) {
      release = await ghrelease.getRelease(octokit, '1.20.110-71');
    }
    assets = await ghrelease.getReleaseAssets(octokit, release, ['brave-portable-(win32|win64).exe']);
    expect(release).not.toBeUndefined();
    expect(assets.length).toEqual(2);
    expect(assets[0].name).toEqual('brave-portable-win32.exe');
    expect(assets[1].name).toEqual('brave-portable-win64.exe');
  });

  it('download a GitHub release asset', async () => {
    if (!release) {
      release = await ghrelease.getRelease(octokit, '1.20.110-71');
    }
    if (!assets) {
      assets = await ghrelease.getReleaseAssets(octokit, release, ['brave-portable-(win32|win64).exe']);
    }
    const releaseAsset = await ghrelease.downloadReleaseAsset(octokit, assets[0], path.join(tmpDir, assets[0].name));
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const {name, size, mime, file} = asset(releaseAsset);
    expect(size).toEqual(4391936);
    expect(mime).toEqual('application/octet-stream');
  });
});
