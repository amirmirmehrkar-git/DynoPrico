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
