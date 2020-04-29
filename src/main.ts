import {parseInputFiles} from './util';
import {VirusTotal} from './virustotal';
import * as core from '@actions/core';

async function run() {
  try {
    const files: string[] = await parseInputFiles(core.getInput('files', {required: true}));
    if (files.length == 0) {
      throw new Error(`'files' input does not include valid file(s).`);
    }

    const vt = new VirusTotal(process.env.VT_API_KEY);
    files.forEach(filepath => {
      core.info(`🏃 Running VirusTotal analysis of ${filepath}...`);
      vt.upload(filepath).then(upres => {
        vt.analysis(upres.data.data.id).then(anres => {
          core.info(
            `🐛 ${filepath} successfully uploaded. Check analysis status at https://www.virustotal.com/gui/file/${anres.data.meta.file_info.sha256}/detection`
          );
        });
      });
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

run();
