import {parseInputFiles} from './util';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';

async function run() {
  try {
    const files: string[] = await parseInputFiles(core.getInput('files', {required: true}));
    if (files.length == 0) {
      throw new Error(`'files' input does not include valid file(s).`);
    }

    core.info(`🏃 Running VirusTotal analysis...`);
    const vt = new VirusTotal(process.env.VT_API_KEY);
    files.forEach(filepath => {
      vt.upload(filepath).then(res => {
        core.info(
          `🐛 ${filepath} successfully uploaded. Check detection analysis at https://www.virustotal.com/gui/file-analysis/${res.data.data.id}/detection`
        );
      });
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
