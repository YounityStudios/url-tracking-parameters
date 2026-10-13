# Rule format

`rules/tracking-parameters.json` is the repository's portable source format.
It is constrained by `schema/tracking-parameters.schema.json`.

```json
{
  "schemaVersion": 1,
  "rulesVersion": 1,
  "globalParameters": ["utm_source"],
  "parameterPrefixes": ["utm_"],
  "hostParameters": {
    "example.com": ["share_token"]
  }
}
```

Consumers should compare parameter names and hostnames case-insensitively. A
host rule applies to its configured domain and every subdomain. Query parameter
values, parameter order, repeated values, URL fragments, paths, and hosts are
outside this format's scope and should be preserved.

`rulesVersion` is an increasing integer. It identifies the content revision,
not an application release. Consumers should reject a ruleset whose schema they
do not support.
