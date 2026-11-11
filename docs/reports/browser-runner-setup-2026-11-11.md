# Browser host setup: failure evidence and actual acceptance

Both browser-dependent jobs of main [43036228492](https://github.com/JasonStys/accessible-design-system-lab/actions/runs/43036228492) failed before browser tests. The moving runner label selected Ubuntu 26.04 image 20261101.186; APT reported temporary DNS failure for Azure/archive/security Ubuntu hosts and exited 100. That is setup evidence, not a failed component or native application, and does not establish the unique DNS cause.

## Preserved unsuccessful first repair

The first corrective source `4d30975032925fa4b80bcf2df6a8cdda6e301542` pinned only the two browser lanes to Ubuntu 24.04 and applied the already-reviewed signed official HTTPS mirror/finite effective APT configuration. [Its actual run 43039258727](https://github.com/JasonStys/accessible-design-system-lab/actions/runs/43039258727) still failed before tests: both guards passed, then the official hosts remained unresolved. Increasing test deadlines or rerunning that source would not be a demonstrated repair.

The logs explicitly list every Chromium runtime library as already installed. The failed downloads were nine additional font packages. Installing the broad OS font/dependency set was therefore a network prerequisite being attempted before any evidence about the actual locked browser. The failed attempts and source remain retained; this report does not relabel them successful.

## Current actual-browser contract

The two lanes keep Ubuntu 24.04 and all original package, Storybook, audit, keyboard, axe, RTL, mobile and browser commands. They download the exact locked Chromium into a fresh checkout-owned cache and execute a mandatory host proof before the original acceptance commands. No operating-system package source or APT setting is changed by the current recipe.

The proof uses the normal public Playwright launch without an alternate executable, validation-skip variable, custom browser arguments or changed sandbox settings. It checks the running browser version against the lock-installed vendor manifest, obtains only that owned browser's main PID through its browser CDP session, and verifies the actual `/proc/PID/exe` path stays within the owned browser cache. Fixed-argv `ldd` must succeed with no missing libraries. A regular installed system sans-serif font must exist; real browser Latin-text measurement, focus and nonoverflow layout must work at 390 and 1400 CSS pixels. Those checks describe actual browser/library/font behavior, rather than assuming that a successful package-install command proves readiness.

An independent Linux regression compiles a tiny inert executable with one required owned shared library. The same linkage checker accepts it, refuses it after that library is renamed away, and accepts it after restoration. No uploaded program or application data is executed. A Windows local run explicitly skips this Linux-only fixture; actual Linux proof remains a hosted requirement.

Browser installation has a five-minute setup bound and the real host proof a two-minute bound, inside the finite 20-minute job. Original test deadlines/retries, coverage floors, runtime source, dependencies and native package version are unchanged. Literal workflow/mutation checks retain the real downstream commands, reject skipped/masked host proof and refuse duplicate job declarations. This is a reviewed-format regression contract, not a general YAML parser or protection against a malicious trusted-main writer.

## Evidence limits

The host probe establishes the exact Chromium process, its installed ELF library closure and usable Latin text/layout. It does not certify every language's glyph set, install the unavailable extra font packs, replace the full actual component/consumer tests or claim assistive-technology certification. All original app/package browser checks must still pass independently. No fresh hosted pass is inferred from local Windows tests. No normal user profile, installed app, public release, global SDK or local OS package configuration is modified.

Primary references: [Playwright browser installation](https://playwright.dev/docs/browsers), [its CI guidance](https://playwright.dev/docs/ci-intro), and the [official runner-images APT implementation](https://github.com/actions/runner-images/blob/main/images/ubuntu/scripts/build/configure-apt.sh). The pinned installed Playwright implementation retains its normal host validation; no internal validation-bypass API is used.
