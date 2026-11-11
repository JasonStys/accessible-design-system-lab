# Browser setup failure and bounded CI repair

The two browser-dependent jobs of main run
[43036228492](https://github.com/JasonStys/accessible-design-system-lab/actions/runs/43036228492)
failed before their browser acceptance commands. Both actual jobs used the moving
`ubuntu-latest` label, which resolved to Ubuntu 26.04 image `20261101.186`.
Playwright's operating-system dependency installation reported temporary DNS
resolution failures for the Azure, archive and security Ubuntu hosts and exited 100. This is observed setup failure, not evidence of a failed component, native
application or generated-package consumer. It also does not establish a unique
cause for those DNS failures.

Only the package/Storybook and browser jobs now select the explicit Ubuntu 24.04
image. They retain all original package, bundle, audit, accessibility, keyboard
and browser acceptance commands. System dependencies and the exact locked
Chromium download are separate 10- and 5-minute steps, within a finite 20-minute
job. Test deadlines, retries, coverage floors, source/runtime code and browser
sandbox settings are unchanged.

The disposable-runner-only preparation verifies GitHub/Linux/x64/Ubuntu 24.04,
the existing mirror-backed source configuration and Ubuntu signature key. It
preserves source suites, components and signature checks while choosing official
HTTPS archive/security mirrors. A last-sorting APT leaf bounds its effective
`Acquire::Retries` and HTTP/HTTPS timeout values and verifies those exact effective
values. This is not a retry-until-pass mechanism or a guarantee against future
DNS/registry outages. Fresh hosted setup and the actual downstream checks must
pass before this repair can be considered accepted.

The actual workflow is tested with mutations removing signed-source guards,
effective options, bounded setup or original downstream commands. This is a
deliberate reviewed-format regression contract, not a general YAML parser or a
replacement for trusted-main review. No private profile, installed application,
published asset, global SDK or local OS APT configuration is modified.

Primary references: the [runner-images APT implementation](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/configure-apt.sh)
documents acquire-option scope, mirror failover and last-sorting configuration;
[Playwright CI guidance](https://playwright.dev/docs/ci-intro) distinguishes browser
installation from actual test execution. The equivalent signed-mirror recipe was
already reviewed in the portfolio site's CI; this repair keeps its boundaries.
