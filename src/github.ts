import * as fs from 'fs';
import {Context} from './util';

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
  mime: string;
  size: number;
  file: Buffer;
}

export const getRelease = async (octokit, context: Context): Promise<Release> => {
  const tag = context.github_ref.replace('refs/tags/', '');
  return (
    await octokit.repos
      .getReleaseByTag({
        owner: context.github_owner,
        repo: context.github_repo,
        tag
      })
      .catch(error => {
        throw new Error(`Cannot get release ${tag}: ${error}`);
      })
  ).data as Release;
};

export const getReleaseAssets = async (octokit, context: Context, release: Release, patterns: Array<string>): Promise<Array<ReleaseAsset>> => {
  return (
    await octokit
      .paginate(octokit.repos.listReleaseAssets, {
        owner: context.github_owner,
        repo: context.github_repo,
        release_id: release.id
      })
      .catch(error => {
        throw new Error(`Cannot list assets for release ${release.tag_name}: ${error}`);
      })
  ).filter(function (asset) {
    return patterns.some(function (pattern) {
      return asset.name.match(pattern);
    });
  }) as Array<ReleaseAsset>;
};

export const downloadReleaseAsset = async (octokit, context: Context, asset: ReleaseAsset, downloadPath: string): Promise<string> => {
  return octokit.repos
    .getReleaseAsset({
      owner: context.github_owner,
      repo: context.github_repo,
      asset_id: asset.id,
      request: {
        headers: {
          Accept: 'application/octet-stream'
        }
      }
    })
    .then(downloadAsset => {
      fs.writeFileSync(downloadPath, Buffer.from(downloadAsset.data), 'binary');
      return downloadPath;
    })
    .catch(error => {
      throw new Error(`Cannot download release asset ${asset.name} (${asset.id}): ${error}`);
    });
};

export const updateReleaseBody = async (octokit, context: Context, release: Release): Promise<Release> => {
  return (
    await octokit.repos
      .updateRelease({
        owner: context.github_owner,
        repo: context.github_repo,
        release_id: release.id,
        body: release.body
      })
      .catch(error => {
        throw new Error(`Cannot update release body: ${error}`);
      })
  ).data as Release;
};
