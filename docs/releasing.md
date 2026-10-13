# Releasing rules

Releases make a reviewed snapshot available to downstream consumers. A release
is not an automatic mandate for consumers to adopt the data.

1. Confirm the pull request is merged and CI is green.
2. Run `node tool/validate_rules.mjs` locally.
3. Increment `rulesVersion` in `rules/tracking-parameters.json`.
4. Update [CHANGELOG.md](../CHANGELOG.md) with the added, removed, or changed
   rules.
5. Create an immutable Git tag named `rules-<rulesVersion>`, such as
   `rules-2`.
6. Create a GitHub release from that tag with the same changelog summary.

Consumers should pin the release tag or release asset they have reviewed. Never
replace the content of an existing release tag.
