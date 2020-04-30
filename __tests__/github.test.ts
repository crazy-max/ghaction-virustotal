import {getRelease, getReleaseAssets, downloadReleaseAsset, Release, ReleaseAsset} from '../src/github';
import * as github from '@actions/github';
import {Context, tmpDir} from '../src/util';
import * as path from 'path';
import {asset} from '../src/virustotal';

const context: Context = {
  github_owner: 'crazy-max',
  github_repo: 'ghaction-virustotal-test',
  github_ref: 'v1.0.0'
};

const octokit = new github.GitHub({auth: process.env.GITHUB_TOKEN || ''});

describe('github', () => {
  let release: Release;
  let assets: Array<ReleaseAsset>;

  describe('getRelease', () => {
    it('returns a GitHub release', async () => {
      release = await getRelease(octokit, context);
      expect(release).not.toBeUndefined();
      expect(release.id).toEqual(26057680);
    });
  });

  describe('getReleaseAssets', () => {
    it('returns a GitHub release assets list', async () => {
      if (!release) release = await getRelease(octokit, context);

      assets = await getReleaseAssets(octokit, context, release);
      expect(release).not.toBeUndefined();
      expect(assets.length).toEqual(2);
      expect(assets[0].name).toEqual('ghaction-virustotal-win32.exe');
    });
  });

  describe('downloadReleaseAsset', () => {
    it('download a GitHub release asset', async () => {
      if (!release) release = await getRelease(octokit, context);
      if (!assets) assets = await getReleaseAssets(octokit, context, release);

      const downloadPath = await downloadReleaseAsset(octokit, context, assets[0], path.join(tmpDir(), assets[0].name));
      let {name, size, mime, file} = asset(downloadPath);
      expect(size).toEqual(1306112);
      expect(mime).toEqual('application/octet-stream');
    });
  });
});
