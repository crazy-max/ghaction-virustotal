import * as glob from 'glob';
import {lstatSync} from 'fs';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

export interface Context {
  github_owner: string;
  github_repo: string;
  github_ref: string;
}

export const parseInputFiles = (files: string): string[] => {
  return files.split(/\r?\n/).reduce<string[]>(
    (acc, line) =>
      acc
        .concat(line.split(','))
        .filter(pat => pat)
        .map(pat => pat.trim()),
    []
  );
};

export const paths = (patterns: string[]): string[] => {
  return patterns.reduce((acc: string[], pattern: string): string[] => {
    return acc.concat(glob.sync(pattern).filter(path => lstatSync(path).isFile()));
  }, []);
};

type Env = {[key: string]: string | undefined};

export const loadContext = (env: Env): Context => {
  let owner = '';
  let repo = '';
  if (env.GITHUB_REPOSITORY) {
    [owner, repo] = env.GITHUB_REPOSITORY.split('/');
  }
  return {
    github_owner: owner,
    github_repo: repo,
    github_ref: env.GITHUB_REF || ''
  };
};

export const tmpDir = (): string => {
  return fs.mkdtempSync(path.join(os.tmpdir(), 'ghaction-virustotal-'));
};
