import {beforeEach, describe, expect, it, jest} from '@jest/globals';
import * as os from 'os';
import * as context from '../src/context';

describe('getInputList', () => {
  it('handles single line correctly', async () => {
    await setInput('foo', 'bar');
    const res = await context.getInputList('foo');
    expect(res).toEqual(['bar']);
  });

  it('handles multiple lines correctly', async () => {
    setInput('foo', 'bar\nbaz');
    const res = await context.getInputList('foo');
    expect(res).toEqual(['bar', 'baz']);
  });

  it('handles comma correctly', async () => {
    setInput('foo', 'bar,baz');
    const res = await context.getInputList('foo');
    expect(res).toEqual(['bar', 'baz']);
  });

  it('handles different new lines correctly', async () => {
    setInput('foo', 'bar\r\nbaz');
    const res = await context.getInputList('foo');
    expect(res).toEqual(['bar', 'baz']);
  });

  it('handles different new lines and comma correctly', async () => {
    setInput('foo', 'bar\r\nbaz,bat');
    const res = await context.getInputList('foo');
    expect(res).toEqual(['bar', 'baz', 'bat']);
  });
});

describe('resolvePaths', () => {
  it('resolves files given a set of paths', async () => {
    expect(context.resolvePaths(['tests/data/**/*'])).toEqual(['tests/data/foo/bar.txt']);
  });
});

describe('setOutput', () => {
  beforeEach(() => {
    process.stdout.write = jest.fn() as typeof process.stdout.write;
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput produces the correct command', () => {
    context.setOutput('some output', 'some value');
    assertWriteCalls([`::set-output name=some output::some value${os.EOL}`]);
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput handles bools', () => {
    context.setOutput('some output', false);
    assertWriteCalls([`::set-output name=some output::false${os.EOL}`]);
  });

  // eslint-disable-next-line jest/expect-expect
  it('setOutput handles numbers', () => {
    context.setOutput('some output', 1.01);
    assertWriteCalls([`::set-output name=some output::1.01${os.EOL}`]);
  });
});

// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value;
}

// Assert that process.stdout.write calls called only with the given arguments.
function assertWriteCalls(calls: string[]): void {
  expect(process.stdout.write).toHaveBeenCalledTimes(calls.length);
  for (let i = 0; i < calls.length; i++) {
    expect(process.stdout.write).toHaveBeenNthCalledWith(i + 1, calls[i]);
  }
}
