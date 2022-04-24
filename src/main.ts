import * as context from './context';
import * as github from './github';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';
import * as path from 'path';

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

    const vt = new VirusTotal(inputs.vtApiKey);
    if (github.context().eventName == 'release') {
      await runForReleaseEvent(vt);
    } else {
      await runForLocalFiles(vt);
    }

    await core.group(`Setting output analysis`, async () => {
      context.setOutput('analysis', outputAnalysis.join(','));
      core.info(`analysis=${outputAnalysis.join(',')}`);
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function runForLocalFiles(vt: VirusTotal) {
  const files: string[] = await context.resolvePaths(inputs.files);
  if (files.length == 0) {
    core.warning(`No files were found. Please check the 'files' input.`);
    return;
  }

  await core.group(`${files.length} file(s) will be sent to VirusTotal for analysis`, async () => {
    await context.asyncForEach(files, async filepath => {
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

async function runForReleaseEvent(vt: VirusTotal) {
  core.info(`Release event detected for ${github.context().ref} in this workflow. Preparing to scan assets...`);

  const release = await github.getRelease(octokit, github.context().ref.replace('refs/tags/', ''));
  release.body = release.body.concat(`\n\n🛡 [VirusTotal GitHub Action](https://github.com/crazy-max/ghaction-virustotal) analysis:`);

  const assets = await github.getReleaseAssets(octokit, release, inputs.files);
  if (assets.length == 0) {
    core.warning(`No assets were found for ${release.tag_name} release tag. Please check the 'files' input.`);
    return;
  }

  core.info(`${assets.length} asset(s) will be sent to VirusTotal for analysis.`);
  await core.group(`${assets.length} asset(s) will be sent to VirusTotal for analysis.`, async () => {
    await context.asyncForEach(assets, async asset => {
      core.debug(`Downloading ${asset.name}`);
      if (inputs.vtMonitor) {
        await vt.monitorItems(await github.downloadReleaseAsset(octokit, asset, path.join(context.tmpDir(), asset.name)), inputs.monitorPath).then(upload => {
          outputAnalysis.push(`${asset.name}=${upload.url}`);
          core.info(`${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
          release.body = release.body.concat(`\n* [\`${asset.name}\`](${upload.url})`);
        });
      } else {
        await vt.files(await github.downloadReleaseAsset(octokit, asset, path.join(context.tmpDir(), asset.name))).then(upload => {
          outputAnalysis.push(`${asset.name}=${upload.url}`);
          core.info(`${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
          release.body = release.body.concat(`\n* [\`${asset.name}\`](${upload.url})`);
        });
      }
    });
  });

  if (/true/i.test(core.getInput('update_release_body'))) {
    core.debug(`Appending analysis link(s) to release body`);
    await github.updateReleaseBody(octokit, release);
  }
}

run();
