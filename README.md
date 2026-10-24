# AlgoHandbook site

The AlgoHandbook interview-prep notes as a responsive React site, published section by section.

**Live today:** DSA cold recall (169 problems) and System Design (5 case studies and WebRTC revision cards).

## Develop

```bash
npm install
npm run dev
```

## Update content from the vault

```bash
npm run ingest                       # default vault path: ~/AlgoHandbook
VAULT_DIR=/path/to/vault npm run ingest
```

This rewrites `src/content/generated/*.json`. Commit the result.

## Deploy to S3 + CloudFront

```bash
scripts/deploy-aws.sh          # build, upload, invalidate
scripts/deploy-aws.sh --no-build
```

Live at **https://oracle.resodesk.com** (CNAME at Namecheap → `dypp4lw2iurly.cloudfront.net`; certificate: the existing `*.resodesk.com` ACM cert in us-east-1). Uses the `resodesk-admin` AWS profile (account 822940159660, override with `AWS_PROFILE`).

- Bucket `oracle-site-822940159660` (ap-south-1) is private; CloudFront distribution `ERFSFT6EXOJIH` reads it through Origin Access Control.
- `assets/*` (hashed) are cached for a year; `index.html` and other files are `no-cache`; every deploy invalidates `/*`.
- CloudFront answers 403/404 with `/index.html` (status 200), so refreshes and shared deep links work.

## Where things are

| Path | What |
| --- | --- |
| `src/theme/theme.ts` | Material 3 theme: colours, type, breakpoints, component defaults |
| `src/content/sections.ts` | Navigation and search: every section and its pages |
| `scripts/ingest-vault.mjs` | Vault HTML → JSON |
| `claude/responsive-guide.md` | Responsive rules (loaded by `CLAUDE.md`) |
