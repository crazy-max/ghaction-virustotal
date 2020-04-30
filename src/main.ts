import {Context, loadContext, parseInputFiles, tmpDir} from './util';
import {getRelease, getReleaseAssets, downloadReleaseAsset} from './github';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as path from 'path';

async function run() {
  try {
    if (!process.env.VT_API_KEY) {
      core.setFailed('You have to provide a VT_API_KEY');
      return;
    }

    const context = loadContext(process.env);
    const vt = new VirusTotal(process.env.VT_API_KEY || '');

    if (github.context.eventName == 'release') {
      await runForReleaseEvent(context, vt);
    } else {
      await runForLocalFiles(context, vt);
    }
  } catch (error) {
    core.setFailed(error.message);
  }
}

async function runForLocalFiles(context: Context, vt: VirusTotal) {
  const files: string[] = await parseInputFiles(core.getInput('files', {required: true}));
  if (files.length == 0) {
    core.warning(`📦 No files were found. Please check the 'files' input.`);
    return;
  }

  core.info(`📦 ${files.length} file(s) will be sent to VirusTotal for analysis.`);
  files.forEach(filepath => {
    vt.upload(filepath).then(res => {
      core.info(
        `🐛 ${filepath} successfully uploaded. Check detection analysis at https://www.virustotal.com/gui/file-analysis/${res.data.data.id}/detection`
      );
    });
  });
}

async function runForReleaseEvent(context: Context, vt: VirusTotal) {
  core.info(`🔔 Release event detected for ${github.context.ref} in this workflow. Preparing to scan assets...`);
  const octokit = new github.GitHub(process.env['GITHUB_TOKEN'] || '');

  const release = await getRelease(octokit, context);
  const assets = await getReleaseAssets(octokit, context, release);
  if (assets.length == 0) {
    core.warning(`📦 No assets were found for ${release.tag_name} release tag.`);
    return;
  }

  core.info(`📦 ${assets.length} asset(s) will be sent to VirusTotal for analysis.`);
  assets.forEach(asset => {
    downloadReleaseAsset(octokit, context, asset, path.join(tmpDir(), asset.name)).then(downloadPath => {
      vt.upload(downloadPath).then(res => {
        core.info(
          `🐛 ${asset.name} successfully uploaded. Check detection analysis at https://www.virustotal.com/gui/file-analysis/${res.data.data.id}/detection`
        );
      });
    });
  });
}

run();
