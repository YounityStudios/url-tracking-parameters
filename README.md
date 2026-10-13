# URL Tracking Parameters

A community-maintained, data-only registry of URL query parameters that are
commonly used for tracking, attribution, advertising, referral, or sharing
context.

The rules are intended for privacy-respecting link-cleaning tools. They contain
no executable code, redirects, regular expressions, or URL rewriting rules.
Consumers decide how to present, download, validate, cache, and apply this
data.

## Who it is for

This repository is useful to browser extensions, mobile apps, desktop tools,
link-sharing services, privacy tools, and anyone building an HTTP(S) URL
cleaner. It is deliberately independent of any application or commercial
service.

## Scope

The canonical ruleset is
[`rules/tracking-parameters.json`](rules/tracking-parameters.json). It defines:

- `globalParameters`: parameter names safe to remove from any HTTP(S) URL.
- `parameterPrefixes`: prefixes safe to remove from any HTTP(S) URL.
- `hostParameters`: parameter names that are removable only for a named domain
  and its subdomains.

Host-specific rules are preferred whenever a parameter could have a legitimate
meaning elsewhere. This registry does not remove path segments, fragments, or
hostnames.

## Simple example

This example removes configured query parameters while preserving the URL's
path, fragment, repeated values, and other query parameters:

```js
const rules = await fetch('tracking-parameters.json').then((response) =>
  response.json(),
);
const url = new URL('https://example.com/article?id=42&utm_source=newsletter');
const hostRules = Object.entries(rules.hostParameters)
  .filter(([host]) => url.hostname === host || url.hostname.endsWith(`.${host}`))
  .flatMap(([, parameters]) => parameters);

for (const [name] of [...url.searchParams]) {
  const parameter = name.toLowerCase();
  const isTrackingParameter =
    rules.globalParameters.includes(parameter) ||
    rules.parameterPrefixes.some((prefix) => parameter.startsWith(prefix)) ||
    hostRules.includes(parameter);
  if (isTrackingParameter) url.searchParams.delete(name);
}

console.log(url.toString());
// https://example.com/article?id=42
```

Production consumers should also validate the schema and use a reviewed,
immutable release rather than a development branch.

## Using the rules

Use tagged releases or immutable release assets in production. Do not consume a
live development branch as an automatic update feed.

See [docs/releasing.md](docs/releasing.md) for the release process.

Before applying a release, consumers should validate it against
[`schema/tracking-parameters.schema.json`](schema/tracking-parameters.schema.json)
and their own product requirements. The reference validator can be run with:

```text
node tool/validate_rules.mjs
```

It validates the ruleset and verifies every fixture in
[`test/fixtures/cleanup-cases.json`](test/fixtures/cleanup-cases.json).

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) before opening an issue or pull
request. The shortest route to a contribution is:

1. Open a **Missed URL cleanup** issue.
2. Provide the original URL and the expected clean URL.
3. Ensure the URL is safe to make public and contains no private data.
4. For a pull request, add a fixture and run `node tool/validate_rules.mjs`.

## Security

See [SECURITY.md](SECURITY.md) for reporting guidance.

## License

Rule data is dedicated to the public domain under CC0-1.0. Tooling and workflow
sources are available under Apache-2.0. See [LICENSES.md](LICENSES.md).
