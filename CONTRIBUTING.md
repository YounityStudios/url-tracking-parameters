# Contributing

Thanks for helping make shared links less revealing.

## Reporting a missed parameter

Open the **Missed URL cleanup** issue form and include:

1. The original URL as it was shared.
2. The expected URL after cleanup.

Only submit URLs that are safe to disclose publicly. Do not include private
documents, account identifiers, access tokens, invitation links, or personal
information.

## Rule criteria

Rules should remove information that is not needed for the destination to open
the same content. A proposed rule needs a reproducible example and should leave
functional query parameters intact.

- Prefer a host-specific rule when a parameter name could be meaningful on
  another website.
- Use a global rule only when the parameter is broadly and consistently used
  for tracking or attribution.
- Do not add URL redirects, path rewrites, fragment removal, or executable
  logic.
- Use lowercase parameter and hostname values. Consumers compare parameter
  names case-insensitively.
- Add a fixture showing both what is removed and what must remain.

## Pull requests

Keep each pull request focused. Run the reference validation before submitting:

```text
node tool/validate_rules.mjs
```

Maintainers review every rule for false-positive risk. Merging a contribution
does not guarantee that downstream consumers will immediately adopt it.
