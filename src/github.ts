import * as github from '@actions/github';
import * as fs from 'fs';
import {Context} from './util';
import * as matcher from 'matcher';

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

export const getRelease = async (octokit: github.GitHub, context: Context): Promise<Release> => {
  const tag = context.github_ref.replace('refs/tags/', '');
  return (
    await octokit.repos.getReleaseByTag({
      owner: context.github_owner,
      repo: context.github_repo,
      tag
    })
  ).data as Release;
};

export const getReleaseAssets = async (octokit: github.GitHub, context: Context, release: Release, patterns: Array<string>): Promise<Array<ReleaseAsset>> => {
  return (await octokit
    .paginate(
      octokit.repos.listAssetsForRelease.endpoint.merge({
        owner: context.github_owner,
        repo: context.github_repo,
        release_id: release.id
      })
    )
    .then(assets => {
      return assets.filter(a => matcher.isMatch(a.name, patterns));
    })) as Array<ReleaseAsset>;
};

export const downloadReleaseAsset = async (octokit: github.GitHub, context: Context, asset: ReleaseAsset, downloadPath: string): Promise<string> => {
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
    });
};

export const updateReleaseBody = async (octokit: github.GitHub, context: Context, release: Release): Promise<Release> => {
  return (
    await octokit.repos.updateRelease({
      owner: context.github_owner,
      repo: context.github_repo,
      release_id: release.id,
      body: release.body
    })
  ).data as Release;
};
