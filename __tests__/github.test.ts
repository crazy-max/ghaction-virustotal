import * as githubm from '../src/github';
import * as utilm from '../src/util';
import {asset} from '../src/virustotal';
import * as github from '@actions/github';
import * as path from 'path';

const context: utilm.Context = {
  github_owner: 'crazy-max',
  github_repo: 'ghaction-virustotal-test',
  github_ref: 'v1.0.0'
};

const octokit = new github.GitHub({auth: process.env.GITHUB_TOKEN || ''});

describe('github', () => {
  let release: githubm.Release;
  let assets: Array<githubm.ReleaseAsset>;

  it('returns a GitHub release', async () => {
    release = await githubm.getRelease(octokit, context);
    expect(release).not.toBeUndefined();
    expect(release.id).toEqual(26057680);
  });

  it('returns a GitHub release assets list', async () => {
    if (!release) {
      release = await githubm.getRelease(octokit, context);
    }

    assets = await githubm.getReleaseAssets(octokit, context, release, ['*.exe']);
    expect(release).not.toBeUndefined();
    expect(assets.length).toEqual(2);
    expect(assets[0].name).toEqual('ghaction-virustotal-win32.exe');
  });

  it('download a GitHub release asset', async () => {
    if (!release) {
      release = await githubm.getRelease(octokit, context);
    }
    if (!assets) {
      assets = await githubm.getReleaseAssets(octokit, context, release, ['*.exe']);
    }

    const releaseAsset = await githubm.downloadReleaseAsset(octokit, context, assets[0], path.join(utilm.tmpDir(), assets[0].name));
    const {name, size, mime, file} = asset(releaseAsset);
    expect(size).toEqual(1306112);
    expect(mime).toEqual('application/octet-stream');
  });
});
