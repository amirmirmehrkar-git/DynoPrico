# Registry credential response

A registry credential was committed to this public repository. Treat it as compromised.

1. Revoke the old token in the Bilt package registry issuer account immediately.
2. Create a replacement with read-only package access and the smallest necessary scope.
3. Set BILT_REGISTRY_TOKEN in the local shell or CI secret store. Never paste it into a tracked file, issue or PR.
4. Verify the old token is revoked through the issuer console and verify installation with the replacement privately.
5. Review the issuer access logs for unexpected use. No claim of compromise or token validity has been verified by this audit.

.npmrc now references the environment variable instead of a literal credential.
This code change does NOT revoke the old token or remove historical copies.
Coordinate history cleanup separately after revocation; deleting the current line or making the repository private is insufficient.

The decision-engine and landing-page branches have unrelated history to main.
Do not force-push, reset or merge these branches without first preserving and reviewing their work.
Project licensing is not yet declared; no reuse license is granted here.

## Dependency security status

The 2026-11-22 remediation uses the Expo SDK 58 dependency set. A fresh npm 10.9.0 audit
reports **0 critical, 0 high and 3 moderate package entries**, compared with 63 total
entries in the original SDK 54 lockfile. CI runs `npm audit --audit-level=high` without
an ignore list or `continue-on-error`.

All three remaining entries describe the same transitive path:
`expo -> @expo/fingerprint@0.21.10 -> minimatch@10.2.6`, covered by
[GHSA-g3hv-75wg-m249](https://github.com/advisories/GHSA-g3hv-75wg-m249).
The advisory requires attacker-controlled glob patterns with `optimizationLevel >= 2`.
The installed fingerprint implementation constructs its ignore matchers with `{ dot: true }`,
leaving the level at the default of 1, and explicitly documents this condition in
`@expo/fingerprint/build/Options.js`. Its public fingerprint configuration does not expose
that option. This supports a non-reachable assessment for this call path; it does not
make the installed minimatch version patched or remove the audit finding.

The current fingerprint release still requires minimatch `^10.2.6`. The patched minimatch
11.0.1 is outside that declared range, so this project does not force a major transitive
override. Update the Expo/fingerprint set when an upstream compatible fix is available,
and re-run the audit and native/web checks. This dependency work does not resolve the
separate registry-token revocation requirement above.
