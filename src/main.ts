import {Context, loadContext, parseInputFiles, resolvePaths, tmpDir, asyncForEach} from './util';
import {getRelease, getReleaseAssets, downloadReleaseAsset} from './github';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';
import * as github from '@actions/github';
import * as path from 'path';

let inputFiles: string[] = [];
let outputAnalysis: string[] = [];

async function run() {
  try {
    if (!process.env.VT_API_KEY) {
      core.setFailed('❌️ You have to provide a VT_API_KEY');
      return;
    }

    inputFiles = await parseInputFiles(core.getInput('files', {required: true}));
    if (inputFiles.length == 0) {
      core.setFailed(`❌️ You must enter at least one path glob in the input 'files'.`);
      return;
    }

    const context = loadContext(process.env);
    const vt = new VirusTotal(process.env.VT_API_KEY || '');

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

async function runForLocalFiles(context: Context, vt: VirusTotal) {
  const files: string[] = await resolvePaths(inputFiles);
  if (files.length == 0) {
    core.warning(`⚠️ No files were found. Please check the 'files' input.`);
    return;
  }

  core.info(`📦 ${files.length} file(s) will be sent to VirusTotal for analysis.`);
  await asyncForEach(files, async filepath => {
    await vt.upload(filepath).then(upload => {
      outputAnalysis.push(`${filepath}=${upload.url}`);
      core.info(`🐛 ${filepath} successfully uploaded. Check detection analysis at ${upload.url}`);
    });
  });
}

async function runForReleaseEvent(context: Context, vt: VirusTotal) {
  core.info(`🔔 Release event detected for ${github.context.ref} in this workflow. Preparing to scan assets...`);
  const octokit = new github.GitHub(process.env['GITHUB_TOKEN'] || '');

  const release = await getRelease(octokit, context);
  const assets = await getReleaseAssets(octokit, context, release, inputFiles);
  if (assets.length == 0) {
    core.warning(`⚠️ No assets were found for ${release.tag_name} release tag. Please check the 'files' input.`);
    return;
  }

  core.info(`📦 ${assets.length} asset(s) will be sent to VirusTotal for analysis.`);
  await asyncForEach(assets, async asset => {
    core.info(`⬇️ Downloading ${asset.name}...`);
    await vt
      .upload(await downloadReleaseAsset(octokit, context, asset, path.join(tmpDir(), asset.name)))
      .then(upload => {
        outputAnalysis.push(`${asset.name}=${upload.url}`);
        core.info(`🐛 ${asset.name} successfully uploaded. Check detection analysis at ${upload.url}`);
      });
  });
}

run();
