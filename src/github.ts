import * as fs from 'fs';
import * as github from '@actions/github';
import {Context} from '@actions/github/lib/context';
import {OctokitOptions} from '@octokit/core/dist-types/types';
import {retry as retryPlugin} from '@octokit/plugin-retry';

export interface Release {
  id: number;
  upload_url: string;
  html_url: string;
  tag_name: string;
  name: string;
  body: string;
  target_commitish: string;
  draft: boolean;
  prerelease: boolean;
}

export interface ReleaseAsset {
  id: number;
  name: string;
  size: number;
}

export type Octokit = ReturnType<typeof github.getOctokit>;

export function context(): Context {
  return github.context;
}

export function getOctokit(token: string, options?: OctokitOptions): Octokit {
  return github.getOctokit(token, options, retryPlugin);
}

export const getRelease = async (octokit: Octokit, tag: string): Promise<Release> => {
  return (
    await octokit.rest.repos
      .getReleaseByTag({
        ...github.context.repo,
        tag
      })
      .catch(error => {
        throw new Error(`Cannot get release ${tag}: ${error}`);
      })
  ).data as Release;
};

export const getReleaseAssets = async (octokit: Octokit, release: Release, patterns: Array<string>): Promise<Array<ReleaseAsset>> => {
  return (
    await octokit
      .paginate(octokit.rest.repos.listReleaseAssets, {
        ...github.context.repo,
        release_id: release.id
      })
      .catch(error => {
        throw new Error(`Cannot list assets for release ${release.tag_name}: ${error}`);
      })
  ).filter(function (asset) {
    return patterns.some(function (pattern) {
      return asset.name.match(pattern);
    });
  });
};

export const downloadReleaseAsset = async (octokit: Octokit, asset: ReleaseAsset, downloadPath: string, retrycb?: (msg: string) => void): Promise<string> => {
  const retries = 10;
  const assetPath = await octokit.rest.repos
    .getReleaseAsset({
      ...github.context.repo,
      asset_id: asset.id,
      headers: {
        accept: 'application/octet-stream'
      },
      request: {
        retries: retries,
        retryAfter: 2
      }
    })
    .then(downloadAsset => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fs.writeFileSync(downloadPath, Buffer.from(downloadAsset.data as any), 'binary');
      return downloadPath;
    })
    .catch(err => {
      if (retrycb && err.request.request && err.request.request.retryCount) {
        retrycb(`Download request failed: ${err}. Retrying (${err.request.request.retryCount}/${retries})...`);
        if (err.request.request.retryCount >= retries) {
          throw new Error(`Cannot download release asset ${asset.name} (${asset.id}): ${err}`);
        }
      }
      if (!err.request.request || err.request.request.retryCount >= retries) {
        throw new Error(`Cannot download release asset ${asset.name} (${asset.id}): ${err}`);
      }
    });
  if (!assetPath) {
    throw new Error(`Cannot download release asset ${asset.name} (${asset.id})`);
  }
  return assetPath;
};

export const updateReleaseBody = async (octokit: Octokit, release: Release): Promise<Release> => {
  return (
    await octokit.rest.repos
      .updateRelease({
        ...github.context.repo,
        release_id: release.id,
        body: release.body
      })
      .catch(error => {
        throw new Error(`Cannot update release body: ${error}`);
      })
  ).data as Release;
};
