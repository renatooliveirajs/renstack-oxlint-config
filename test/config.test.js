import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import {
  existsSync,
  mkdtempSync,
  readFileSync,
  rmSync,
  writeFileSync
} from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { fileURLToPath } from 'node:url';

import base from '@renstack/oxlint-config';
import baseAlias from '@renstack/oxlint-config/base';
import next from '@renstack/oxlint-config/next';
import node from '@renstack/oxlint-config/node';
import format from '@renstack/oxlint-config/oxfmt';
import react from '@renstack/oxlint-config/react';

const root = fileURLToPath(new URL('../', import.meta.url));
const oxlint = `${root}node_modules/.bin/oxlint`;
const oxfmt = `${root}node_modules/.bin/oxfmt`;

/** @param {(directory: string) => void} run */
function withProject(run) {
  const temporaryRoot = existsSync('/tmp/opencode')
    ? '/tmp/opencode'
    : tmpdir();
  const directory = mkdtempSync(join(temporaryRoot, 'renstack-config-'));
  try {
    run(directory);
  } finally {
    rmSync(directory, { recursive: true, force: true });
  }
}

test('deve exportar os presets e preservar sua herança', () => {
  assert.equal(base, baseAlias);
  assert.ok(react.plugins?.includes('react'));
  assert.ok(next.plugins?.includes('nextjs'));
  assert.ok(node.plugins?.includes('node'));
  assert.equal(node.env?.browser, false);
  assert.equal(next.env?.node, true);
  assert.equal(react.rules?.['eslint/no-debugger'], 'error');
  assert.equal(next.rules?.['react/rules-of-hooks'], 'error');
  assert.equal(base.plugins?.includes('react'), false);
});

const fixtures = [
  {
    name: 'base',
    valid: 'export const value: number = 1;\n',
    invalid: 'debugger;\n',
    rule: 'no-debugger'
  },
  {
    name: 'react',
    valid: 'export const App = () => <main>Hello</main>;\n',
    invalid: 'export const App = () => <img />;\n',
    rule: 'alt-text'
  },
  {
    name: 'next',
    valid: 'export default function Page() { return <main>Hello</main>; }\n',
    invalid: 'export default function Page() { return <head />; }\n',
    rule: 'no-head-element'
  },
  {
    name: 'node',
    valid: 'export const version = process.version;\n',
    invalid: 'debugger;\n',
    rule: 'no-debugger'
  }
];

for (const fixture of fixtures) {
  test(`deve carregar a config TypeScript e aplicar as regras do preset ${fixture.name} via CLI`, () => {
    withProject((directory) => {
      const configUrl = new URL(`../src/${fixture.name}.js`, import.meta.url)
        .href;
      writeFileSync(
        `${directory}/oxlint.config.ts`,
        `import config from ${JSON.stringify(configUrl)};\nexport default config;\n`
      );
      const source = `${directory}/fixture.tsx`;
      writeFileSync(source, fixture.valid);
      const valid = spawnSync(oxlint, ['--deny-warnings', source], {
        cwd: directory,
        encoding: 'utf8'
      });
      assert.equal(valid.status, 0, valid.stdout + valid.stderr);
      writeFileSync(source, fixture.invalid);
      const invalid = spawnSync(oxlint, [source], {
        cwd: directory,
        encoding: 'utf8'
      });
      assert.equal(invalid.status, 1, invalid.stdout + invalid.stderr);
      assert.ok((invalid.stdout + invalid.stderr).includes(fixture.rule));
    });
  });
}

test('deve carregar a config TypeScript do Oxfmt e formatar um projeto consumidor', () => {
  withProject((directory) => {
    const configUrl = new URL('../src/oxfmt.js', import.meta.url).href;
    writeFileSync(
      `${directory}/oxfmt.config.ts`,
      `import config from ${JSON.stringify(configUrl)};\nexport default config;\n`
    );
    const source = `${directory}/fixture.ts`;
    writeFileSync(source, 'export const greeting="hello"');
    const result = spawnSync(oxfmt, ['--write', source], {
      cwd: directory,
      encoding: 'utf8'
    });
    assert.equal(result.status, 0, result.stdout + result.stderr);
    assert.equal(
      readFileSync(source, 'utf8'),
      "export const greeting = 'hello';\n"
    );
    assert.equal(format.singleQuote, true);
  });
});
