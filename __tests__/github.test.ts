import * as fs from 'fs';
import * as path from 'path';
import * as dotenv from 'dotenv';
import * as context from '../src/context';
import * as github from '../src/github';
import {asset} from '../src/virustotal';
import {Context} from '@actions/github/lib/context';

let octokit;

jest.spyOn(context, 'tmpDir').mockImplementation((): string => {
  const tmpDir = path.join('/tmp/.ghaction-virustotal-jest').split(path.sep).join(path.posix.sep);
  if (!fs.existsSync(tmpDir)) {
    fs.mkdirSync(tmpDir, {recursive: true});
  }
  return tmpDir;
});

jest.spyOn(github, 'context').mockImplementation(
  (): Context => {
    return new Context();
  }
);

beforeEach(() => {
  Object.keys(process.env).forEach(function (key) {
    if (key !== 'GITHUB_TOKEN' && key.startsWith('GITHUB_')) {
      delete process.env[key];
    }
  });
  const repoEnv = dotenv.parse(fs.readFileSync(path.join(__dirname, 'fixtures', 'repo.env')));
  for (const k in repoEnv) {
    process.env[k] = repoEnv[k];
  }
  octokit = github.getOctokit(process.env.GITHUB_TOKEN || '', {
    log: console
  });
});

describe('github', () => {
  let release: github.Release;
  let assets: Array<github.ReleaseAsset>;

  it('returns a GitHub release', async () => {
    release = await github.getRelease(octokit, '1.20.110-71');
    expect(release).not.toBeUndefined();
    expect(release.id).toEqual(38769571);
  });

  it('returns a GitHub release assets list', async () => {
    if (!release) {
      release = await github.getRelease(octokit, '1.20.110-71');
    }

    assets = await github.getReleaseAssets(octokit, release, ['brave-portable-(win32|win64).exe']);
    expect(release).not.toBeUndefined();
    expect(assets.length).toEqual(2);
    expect(assets[0].name).toEqual('brave-portable-win32.exe');
    expect(assets[1].name).toEqual('brave-portable-win64.exe');
  });

  it('download a GitHub release asset', async () => {
    if (!release) {
      release = await github.getRelease(octokit, '1.20.110-71');
    }
    if (!assets) {
      assets = await github.getReleaseAssets(octokit, release, ['brave-portable-(win32|win64).exe']);
    }

    const releaseAsset = await github.downloadReleaseAsset(octokit, assets[0], path.join(context.tmpDir(), assets[0].name));
    const {name, size, mime, file} = asset(releaseAsset);
    expect(size).toEqual(4391936);
    expect(mime).toEqual('application/octet-stream');
  });
});
