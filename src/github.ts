import * as fs from 'fs';
import * as github from '@actions/github';
import {Context} from '@actions/github/lib/context';
import {GitHub} from '@actions/github/lib/utils';
import {OctokitOptions} from '@octokit/core/dist-types/types';

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

export function context(): Context {
  return github.context;
}

export function getOctokit(token: string, options?: OctokitOptions): InstanceType<typeof GitHub> {
  return github.getOctokit(token, options);
}

export const getRelease = async (octokit: InstanceType<typeof GitHub>, tag: string): Promise<Release> => {
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

export const getReleaseAssets = async (octokit: InstanceType<typeof GitHub>, release: Release, patterns: Array<string>): Promise<Array<ReleaseAsset>> => {
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

export const downloadReleaseAsset = async (octokit: InstanceType<typeof GitHub>, asset: ReleaseAsset, downloadPath: string): Promise<string> => {
  return octokit.rest.repos
    .getReleaseAsset({
      ...github.context.repo,
      asset_id: asset.id,
      headers: {
        accept: 'application/octet-stream'
      }
    })
    .then(downloadAsset => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      fs.writeFileSync(downloadPath, Buffer.from(downloadAsset.data as any), 'binary');
      return downloadPath;
    })
    .catch(error => {
      throw new Error(`Cannot download release asset ${asset.name} (${asset.id}): ${error.message}`);
    });
};

export const updateReleaseBody = async (octokit: InstanceType<typeof GitHub>, release: Release): Promise<Release> => {
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
