import {describe, expect, it} from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

import * as context from '../src/context.js';

describe('tmpDir', () => {
  it('returns the same directory and normalizes path separators', () => {
    const first = context.tmpDir();
    const second = context.tmpDir();
    const nativePath = first.split(path.posix.sep).join(path.sep);
    expect(first).toBe(second);
    expect(first).not.toContain('\\');
    expect(fs.existsSync(nativePath)).toBeTruthy();
  });
});

describe('getInputList', () => {
  it('handles single line correctly', async () => {
    setInput('foo', 'bar');
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

describe('asyncForEach', () => {
  it('iterates sequentially and passes expected callback arguments', async () => {
    const input = ['a', 'b', 'c'];
    const order: string[] = [];
    const callbackArgs: Array<[string, number, string[]]> = [];
    await context.asyncForEach(input, async (item, index, array) => {
      callbackArgs.push([item, index, array]);
      await new Promise(resolve => setTimeout(resolve, index === 0 ? 20 : 1));
      order.push(item);
    });
    expect(order).toEqual(['a', 'b', 'c']);
    expect(callbackArgs).toEqual([
      ['a', 0, input],
      ['b', 1, input],
      ['c', 2, input]
    ]);
  });
});

describe('resolvePaths', () => {
  it('resolves files given a set of paths', async () => {
    expect(context.resolvePaths(['tests/fixtures/data/**/*'])).toEqual([path.join('tests', 'fixtures', 'data', 'foo', 'bar.txt')]);
  });
});

// See: https://github.com/actions/toolkit/blob/master/packages/core/src/core.ts#L67
function getInputName(name: string): string {
  return `INPUT_${name.replace(/ /g, '_').toUpperCase()}`;
}

function setInput(name: string, value: string): void {
  process.env[getInputName(name)] = value;
}
