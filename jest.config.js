/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('fs');
const os = require('os');
const path = require('path');

const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'ghaction-virustotal-'));

process.env = Object.assign({}, process.env, {
  TEMP: tmpDir,
  GITHUB_REPOSITORY: 'crazy-max/ghaction-virustotal',
  RUNNER_TEMP: path.join(tmpDir, 'runner-temp'),
  RUNNER_TOOL_CACHE: path.join(tmpDir, 'runner-tool-cache')
});

module.exports = {
  clearMocks: true,
  testEnvironment: 'node',
  moduleFileExtensions: ['js', 'ts'],
  setupFiles: ['dotenv/config'],
  testMatch: ['**/*.test.ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest'
  },
  collectCoverageFrom: ['src/**/{!(main.ts),}.ts'],
  coveragePathIgnorePatterns: ['dist/', 'node_modules/', '__tests__/'],
  verbose: true
};
