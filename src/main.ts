import * as githubm from './github';
import * as utilm from './util';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as path from 'path';

let inputFiles: string[] = [];
let inputVtMonitor: boolean = false;
let inputMonitorPath: string;
let outputAnalysis: string[] = [];

async function run() {
  try {
    const vtApiKey: string = core.getInput('vt_api_key', {required: true});

    inputVtMonitor = /true/i.test(core.getInput('vt_monitor'));
    inputMonitorPath = core.getInput('monitor_path') || '/';
    inputFiles = await utilm.parseInputFiles(core.getInput('files', {required: true}));
    if (inputFiles.length == 0) {
      core.setFailed(`You must enter at least one path glob in the input 'files'`);
      return;
    }

    const context = utilm.loadContext(process.env);
    const vt = new VirusTotal(vtApiKey);

    if (github.context.eventName == 'release') {
      await runForReleaseEvent(context, vt);
    } else {
      await runForLocalFiles(context, vt);
    }

    core.info('🛒 Setting output analysis...');
    core.setOutput('analysis', outputAnalysis.join(','));
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function runForLocalFiles(context: utilm.Context, vt: VirusTotal) {
  const files: string[] = await utilm.resolvePaths(inputFiles);
  if (files.length == 0) {
    core.warning(`⚠️ No files were found. Please check the 'files' input.`);
    return;
  }

  core.info(`📦 ${files.length} file(s) will be sent to VirusTotal for analysis.`);
  await utilm.asyncForEach(files, async filepath => {
    if (inputVtMonitor) {
      await vt.monitorItems(filepath, inputMonitorPath).then(upload => {
        outputAnalysis.push(`${filepath}=${upload.url}`);
        core.info(`🐛 ${filepath} successfully uploaded to monitor. Check detection analysis at ${upload.url}`);
      });
    } else {
      await vt.files(filepath).then(upload => {
        outputAnalysis.push(`${filepath}=${upload.url}`);
        core.info(`🐛 ${filepath} successfully uploaded. Check detection analysis at ${upload.url}`);
      });
    }
  });
}

async function runForReleaseEvent(context: utilm.Context, vt: VirusTotal) {
  core.info(`🔔 Release event detected for ${github.context.ref} in this workflow. Preparing to scan assets...`);
  const githubToken: string = core.getInput('github_token', {required: true});
  const octokit = github.getOctokit(githubToken);

  const release = await githubm.getRelease(octokit, context);
  release.body = release.body.concat(`\n\n🛡 [VirusTotal GitHub Action](https://github.com/crazy-max/ghaction-virustotal) analysis:`);

  const assets = await githubm.getReleaseAssets(octokit, context, release, inputFiles);
  if (assets.length == 0) {
    core.warning(`⚠️ No assets were found for ${release.tag_name} release tag. Please check the 'files' input.`);
    return;
  }

  core.info(`📦 ${assets.length} asset(s) will be sent to VirusTotal for analysis.`);
  await utilm.asyncForEach(assets, async asset => {
    core.info(`⬇️ Downloading ${asset.name}...`);
    if (inputVtMonitor) {
      await vt.monitorItems(await githubm.downloadReleaseAsset(octokit, context, asset, path.join(utilm.tmpDir(), asset.name)), inputMonitorPath).then(upload => {
        outputAnalysis.push(`${asset.name}=${upload.url}`);
        core.info(`🐛 ${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
        release.body = release.body.concat(`\n* [\`${asset.name}\`](${upload.url})`);
      });
    } else {
      await vt.files(await githubm.downloadReleaseAsset(octokit, context, asset, path.join(utilm.tmpDir(), asset.name))).then(upload => {
        outputAnalysis.push(`${asset.name}=${upload.url}`);
        core.info(`🐛 ${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
        release.body = release.body.concat(`\n* [\`${asset.name}\`](${upload.url})`);
      });
    }
  });

  if (/true/i.test(core.getInput('update_release_body'))) {
    core.info(`✍️ Appending analysis link(s) to release body...`);
    await githubm.updateReleaseBody(octokit, context, release);
  }
}

run();
