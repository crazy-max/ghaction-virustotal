import * as context from './context';
import * as github from './github';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';
import * as path from 'path';
import {RateLimiter} from 'limiter';

let octokit;
let inputs: context.Inputs;
const outputAnalysis: string[] = [];

async function run() {
  try {
    inputs = await context.getInputs();
    if (inputs.files.length == 0) {
      core.setFailed(`You must enter at least one path glob in the input 'files'`);
      return;
    }

    octokit = github.getOctokit(inputs.githubToken);

    const limiter = inputs.requestRate > 0 ? new RateLimiter({tokensPerInterval: inputs.requestRate, interval: 'minute'}) : undefined;
    const vt = new VirusTotal(inputs.vtApiKey);
    if (github.context().eventName == 'release') {
      await runForReleaseEvent(vt, limiter);
    } else {
      await runForLocalFiles(vt, limiter);
    }

    await core.group(`Setting output analysis`, async () => {
      core.setOutput('analysis', outputAnalysis.join(','));
      core.info(`analysis=${outputAnalysis.join(',')}`);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function runForLocalFiles(vt: VirusTotal, limiter: RateLimiter | undefined) {
  const files: string[] = context.resolvePaths(inputs.files);
  if (files.length == 0) {
    core.warning(`No files were found. Please check the 'files' input.`);
    return;
  }

  await core.group(`${files.length} file(s) will be sent to VirusTotal for analysis`, async () => {
    await context.asyncForEach(files, async filepath => {
      if (limiter !== undefined) {
        const remainingRequests = await limiter.removeTokens(1);
        core.debug(`limiter: remaining requests: ${remainingRequests}`);
      }
      if (inputs.vtMonitor) {
        await vt.monitorItems(filepath, inputs.monitorPath).then(upload => {
          outputAnalysis.push(`${filepath}=${upload.url}`);
          core.info(`${filepath} successfully uploaded to monitor. Check detection analysis at ${upload.url}`);
        });
      } else {
        await vt.files(filepath).then(upload => {
          outputAnalysis.push(`${filepath}=${upload.url}`);
          core.info(`${filepath} successfully uploaded. Check detection analysis at ${upload.url}`);
        });
      }
    });
  });
}

async function runForReleaseEvent(vt: VirusTotal, limiter: RateLimiter | undefined) {
  core.info(`Release event detected for ${github.context().ref} in this workflow. Preparing to scan assets...`);

  const release = await github.getRelease(octokit, github.context().ref.replace('refs/tags/', ''));

  const assets = await github.getReleaseAssets(octokit, release, inputs.files);
  if (assets.length == 0) {
    core.warning(`No assets were found for ${release.tag_name} release tag. Please check the 'files' input.`);
    return;
  }

  if (assets.length <= 5) {
    release.body = release.body.concat(`\n\n🛡 [VirusTotal GitHub Action](https://github.com/crazy-max/ghaction-virustotal) analysis:`);
  } else {
    release.body = release.body.concat(`\n\n<details>\n  <summary>🛡 VirusTotal analysis</summary>\n`);
  }

  core.info(`${assets.length} asset(s) will be sent to VirusTotal for analysis.`);
  await core.group(`${assets.length} asset(s) will be sent to VirusTotal for analysis.`, async () => {
    const dlretrycb = (msg: string): void => {
      core.debug(msg);
    };
    await context.asyncForEach(assets, async asset => {
      core.info(`Downloading release asset ${asset.name}...`);
      if (limiter !== undefined) {
        const remainingRequests = await limiter.removeTokens(1);
        core.debug(`Limiter: remaining requests: ${remainingRequests}`);
      }
      if (inputs.vtMonitor) {
        await vt.monitorItems(await github.downloadReleaseAsset(octokit, asset, path.join(context.tmpDir(), asset.name), dlretrycb), inputs.monitorPath).then(upload => {
          outputAnalysis.push(`${asset.name}=${upload.url}`);
          core.info(`${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
          release.body = release.body.concat(`\n  * [\`${asset.name}\`](${upload.url})`);
        });
      } else {
        await vt.files(await github.downloadReleaseAsset(octokit, asset, path.join(context.tmpDir(), asset.name), dlretrycb)).then(upload => {
          outputAnalysis.push(`${asset.name}=${upload.url}`);
          core.info(`${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
          release.body = release.body.concat(`\n  * [\`${asset.name}\`](${upload.url})`);
        });
      }
    });
  });
  if (assets.length > 5) {
    release.body = release.body.concat(`\n<sub>These scans were produced by the [VirusTotal GitHub Action](https://github.com/crazy-max/ghaction-virustotal)</sub></details>\n`);
  }

  if (/true/i.test(core.getInput('update_release_body'))) {
    core.debug(`Appending analysis link(s) to release body`);
    await github.updateReleaseBody(octokit, release);
  }
}

run();
