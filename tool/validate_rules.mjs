// SPDX-License-Identifier: Apache-2.0

import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const rulesPath = join(root, 'rules', 'tracking-parameters.json');
const fixturesPath = join(root, 'test', 'fixtures', 'cleanup-cases.json');
const parameterPattern = /^[a-z0-9._~-]{1,128}$/;
const hostPattern = /^(?=.{1,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9-]{2,63}$/;

function readJson(path) {
  return JSON.parse(readFileSync(path, 'utf8'));
}

function fail(message) {
  throw new Error(message);
}

function sorted(values) {
  return [...values].sort();
}

function hasSortedUniqueValues(values) {
  return values.every(
    (value, index) => index === 0 || values[index - 1].localeCompare(value) < 0,
  );
}

function validateParameterList(name, values) {
  if (!Array.isArray(values)) fail(`${name} must be an array`);
  if (!values.every((value) => typeof value === 'string')) {
    fail(`${name} must contain only strings`);
  }
  if (!values.every((value) => parameterPattern.test(value))) {
    fail(`${name} contains an invalid parameter name`);
  }
  if (!hasSortedUniqueValues(values)) fail(`${name} must be sorted and unique`);
}

function validateRules(payload) {
  if (payload === null || typeof payload !== 'object' || Array.isArray(payload)) {
    fail('ruleset must be an object');
  }

  const expectedKeys = [
    'globalParameters',
    'hostParameters',
    'parameterPrefixes',
    'rulesVersion',
    'schemaVersion',
  ];
  const actualKeys = sorted(Object.keys(payload));
  if (actualKeys.join('\n') !== expectedKeys.join('\n')) {
    fail('ruleset has missing or unsupported fields');
  }
  if (payload.schemaVersion !== 1) fail('unsupported schemaVersion');
  if (!Number.isInteger(payload.rulesVersion) || payload.rulesVersion < 1) {
    fail('rulesVersion must be a positive integer');
  }

  validateParameterList('globalParameters', payload.globalParameters);
  validateParameterList('parameterPrefixes', payload.parameterPrefixes);

  if (
    payload.hostParameters === null ||
    typeof payload.hostParameters !== 'object' ||
    Array.isArray(payload.hostParameters)
  ) {
    fail('hostParameters must be an object');
  }
  const hosts = Object.keys(payload.hostParameters);
  if (hosts.join('\n') !== sorted(hosts).join('\n')) {
    fail('hostParameters must be sorted by hostname');
  }
  for (const host of hosts) {
    if (!hostPattern.test(host)) fail(`hostParameters contains an invalid hostname: ${host}`);
    validateParameterList(`hostParameters.${host}`, payload.hostParameters[host]);
  }
}

function removesParameter(name, host, rules) {
  const parameter = name.toLowerCase();
  const normalizedHost = host.toLowerCase();
  if (rules.globalParameters.includes(parameter)) return true;
  if (rules.parameterPrefixes.some((prefix) => parameter.startsWith(prefix))) {
    return true;
  }
  return Object.entries(rules.hostParameters).some(
    ([configuredHost, parameters]) =>
      (normalizedHost === configuredHost || normalizedHost.endsWith(`.${configuredHost}`)) &&
      parameters.includes(parameter),
  );
}

function cleanUrl(value, rules) {
  const url = new URL(value);
  const keptParameters = [...url.searchParams].filter(
    ([name]) => !removesParameter(name, url.hostname, rules),
  );
  url.search = new URLSearchParams(keptParameters).toString();
  return url.toString();
}

function validateFixtures(rules) {
  const fixtures = readJson(fixturesPath);
  if (!Array.isArray(fixtures) || fixtures.length === 0) {
    fail('fixtures must be a non-empty array');
  }
  for (const fixture of fixtures) {
    const expectedKeys = ['description', 'expected', 'input'];
    if (
      fixture === null ||
      typeof fixture !== 'object' ||
      Array.isArray(fixture) ||
      sorted(Object.keys(fixture)).join('\n') !== expectedKeys.join('\n')
    ) {
      fail('each fixture must have description, input, and expected');
    }
    const actual = cleanUrl(fixture.input, rules);
    if (actual !== fixture.expected) {
      fail(
        `fixture failed: ${fixture.description}\nexpected: ${fixture.expected}\nactual:   ${actual}`,
      );
    }
  }
  return fixtures.length;
}

try {
  const rules = readJson(rulesPath);
  validateRules(rules);
  const fixtureCount = validateFixtures(rules);
  console.log(`Validated rules version ${rules.rulesVersion} with ${fixtureCount} cleanup fixtures.`);
} catch (error) {
  console.error(`Validation failed: ${error.message}`);
  process.exitCode = 1;
}
