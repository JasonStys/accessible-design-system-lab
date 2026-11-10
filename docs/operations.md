# Operations and release runbook

## Local verification

```bash
npm ci
npx playwright install chromium
npm run verify
npm run test:e2e
```

## Release candidate

1. Confirm CI, CodeQL, and dependency review are green on the candidate commit.
2. Review API/type changes and record breaking changes in an ADR and migration note.
3. Complete the manual screen-reader checklist for changed interactions.
4. Run `npm pack --dry-run` and inspect included files.
5. Run `npm run package:smoke` from a clean build.
6. Update the version and release notes only after evidence is complete.
7. Create a signed/tagged GitHub release; registry publication remains manual and out of scope.

## Rollback

Because artifacts are immutable, restore the last validated version in the consumer lockfile. Do
not overwrite a published version. For a faulty unpublished commit, create a normal correcting
commit so history and evidence remain reviewable.

## CI failure triage

- Formatting/lint/type failures: reproduce with the named npm script.
- Unit/coverage failures: inspect `coverage/index.html` and the failing semantic assertion.
- Browser failures: download `playwright-report` and traces from the Actions artifact.
- Bundle failure: inspect `docs/reports/generated/bundle-budget.json` and dependency changes.
- Package failure: run `npm run package:smoke`; inspect the actual installed consumer build/React DOM assertion. The smoke requires Chromium, disables dependency scripts, and never imports repository source or reuses an existing listener.
- Repository failure: run `npm run symbols` followed by `npm run repository:check`.

## Escalation

Security findings use the private advisory workflow described in `SECURITY.md`. Accessibility
regressions block release until the contract is restored or an explicit, documented limitation is
approved.

## Package identity and test prerequisites

`package:smoke` installs the final TGZ into its own temporary consumer and reports its SHA-256 after actual public-import/CSS build and React/browser acceptance. Keep that evidence with the corresponding built archive; changes to packed README/content produce a different archive identity. The checksum alone is not a signed publisher identity. Do not retarget old artifacts or describe local/CI packages as signed installers.

Browser installation is explicit: `npx playwright install chromium` locally, or `npx playwright install --with-deps chromium` on a supported CI host. The package CI job installs the browser before its actual-consumer gate. Both existing source/catalog browser tests and the shipping-boundary consumer remain required. Registry access (or a populated cache) is needed for exact reviewed React peers; no account credentials are required.
