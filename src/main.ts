import * as core from '@actions/core';
import * as mime from 'mime';
import * as fs from 'fs';

export async function run() {
  try {
    const files: string[] = await parseInputFiles(core.getInput('files', {required: true}));

    if (!process.env['VT_API_KEY']) {
      core.setFailed('❌️ You have to provide a VT_API_KEY');
      return;
    } else if (files.length == 0) {
      core.setFailed(`❌️ 'files' input does not include valid file(s).`);
      return;
    }

    const nvt = require('node-virustotal');
    const nvtCon = nvt.MakePublicConnection();
    nvtCon.setKey(process.env['VT_API_KEY']);
    nvtCon.setDelay(15000);

    files.forEach(filepath => {
      nvtCon.submitFileForAnalysis(
        filepath.replace(/^.*[\\\/]/, ''),
        mime.getType(filepath),
        fs.readFileSync(filepath),
        function (fileclear) {
          core.info(
            `🐛 ${filepath} successfully uploaded. Check analysis status at https://www.virustotal.com/gui/file/${fileclear.scan_id}/detection`
          );
        },
        function (err) {
          core.info(`❌ Error during analysis of ${filepath}: ${err.message}`);
        }
      );
    });
  } catch (error) {
    core.setFailed(error.message);
  }
}

const parseInputFiles = (files: string): string[] => {
  return files.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  );
};

run();
