import * as glob from 'glob';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import * as core from '@actions/core';
import {issueCommand} from '@actions/core/lib/command';

let _tmpDir: string;

export interface Inputs {
  vtApiKey: string;
  files: string[];
  vtMonitor: boolean;
  monitorPath: string;
  updateReleaseBody: boolean;
  githubToken: string;
}

export function tmpDir(): string {
  if (!_tmpDir) {
    _tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghaction-virustotal-')).split(path.sep).join(path.posix.sep);
  }
  return _tmpDir;
}

export async function getInputs(): Promise<Inputs> {
  return {
    vtApiKey: core.getInput('vt_api_key'),
    files: await getInputList('files'),
    vtMonitor: core.getBooleanInput('vt_monitor'),
    monitorPath: core.getInput('monitor_path') || '/',
    updateReleaseBody: core.getBooleanInput('update_release_body'),
    githubToken: core.getInput('github_token')
  };
}

export async function getInputList(name: string): Promise<string[]> {
  const items = core.getInput(name);
  if (items == '') {
    return [];
  }
  return items.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  );
}

export const asyncForEach = async (array, callback) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

export const resolvePaths = (patterns: string[]): string[] => {
  return patterns.reduce((acc: string[], pattern: string): string[] => {
    return acc.concat(glob.sync(pattern).filter(path => fs.lstatSync(path).isFile()));
  }, []);
};

// FIXME: Temp fix https://github.com/actions/toolkit/issues/777
export function setOutput(name: string, value: unknown): void {
  issueCommand('set-output', {name}, value);
}
