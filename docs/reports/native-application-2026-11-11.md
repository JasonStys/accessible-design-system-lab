# Practical component authoring and native application validation

The complete original library/catalog now contains a real bounded blueprint
authoring workspace. It validates edited data, previews the actual public
components, preserves unapplied selected-block edits, supports deliberate
reordering/removal and produces literal React/CSS/JSON exports. Native storage
adds explicit revision-aware Save/Load and a complete previous revision.

Observed local Windows source checks:

| Check                              | Observed result and denominator                                                                                                                                                                                                                                                                                                                                                                                               |
| ---------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Components and blueprint core      | 53 tests passed. The measured set explicitly includes the original reusable components and `src/authoring/project.ts`: 99.61% lines, 95.65% branches, 98.75% functions and 98.30% statements. Original floors remain 90/80/90/90 respectively. This is not whole-desktop code coverage.                                                                                                                                       |
| Native local boundaries            | 13 actual Node tests passed, including real NTFS hardlinks/junctions, saved revision/restart, prior-byte preservation, fixed asset hashes and an actual owned loopback listener.                                                                                                                                                                                                                                              |
| Archive boundaries                 | Six standard-library Python methods passed, including ten malicious-name subcases, actual hardlinks, no-overwrite, timestamp preservation and actual source growth.                                                                                                                                                                                                                                                           |
| Original and new browser workflows | All 14 desktop/mobile Chromium journeys passed, including keyboard/focus/axe, last-good preview, literal imported text, exact JSON download and unapplied selected-block preservation. This is a two-profile browser set, not every assistive technology.                                                                                                                                                                     |
| Independent package consumer       | The actual final TGZ installs outside the repository. Five generated React variants compile under strict TypeScript and unused-variable checks with the explicit standard bundler CSS type contract. The generated output is genuinely built/mounted in Chromium, with real fields, button announcements, table sort, modal focus return, styles, axe and zero outside requests. All original installed-package cases remain. |
| Full compiled native candidate     | An honestly dirty development package over baseline `085fdf911ab18aec3ad5701f83485dcdd9653cff` completed two actual launches and normal exits 0/0, realistic authored data, real components, explicit files, malformed UTF-8 preservation, durable restart and an accepted asynchronous export retained through repeated native Close. New clean-source/hosted proof is separate.                                             |

Strict lint/types and the actual native dependency audit are independent gates.
The new Windows workflow builds the complete application, relocates its full ZIP
and repeats its actual consumer; ordinary runs retain bounded receipts/screenshots
only. Original CI and its JavaScript CodeQL identity are retained; separate
Python/Actions analyses cover the new build tooling without source exclusions.
No hosted passing, release, installation or clean-machine result is inferred from
the local candidate.

## Genuine failures corrected

The first packaging CLI accepted an incorrectly shaped command-line resource
configuration without copying its resources. The build now uses a structured
configuration file and verifies the actual copied source identity before calling
the package complete; the failed output remains preserved.

The initial native owner compared Electron's virtual ASAR file identity with a
physical descriptor identity. An actual own-project Electron probe demonstrated
the different inode/device metadata. Fixed, already-executing packaged source
uses the ASAR filesystem for its hash check; user imports and durable files retain
the separate bounded regular-descriptor boundary. The temporary session directory
is created explicitly before Electron is given that path.

Real native use also caught unstable implicit names on wrapped select controls;
they now have deliberate accessible names. The actual generated-code consumer
caught its own helper-placement error and missing explicit CSS/bundler types.
Both are repaired, and all five exported variants now compile and execute. The
test did not remove strict unused/type checking or replace the installed library
with repository source. Exact official SHA-512 metadata was added to the two
already-pinned React type packages; dependency versions did not change.

The authoring state model additionally prevents a valid preview or export from
silently discarding edits in the selected-block editor, including an emptied
editor. Apply or explicit Discard is required, with a real mobile/desktop journey.

## Limits

This is an unsigned Windows x64 portable candidate. It is not a cross-platform
native installer, production account service, web hosting deployment, complete
screen-reader audit or accessibility certification. One current design and its
previous complete revision are plaintext in an identified trusted OS-owner
profile. Markers/hashes are provenance and accidental-concurrency controls, not
authentication against a malicious same-owner writer. Alias checks are static
admission, not a race-proof filesystem namespace. Imported blueprints contain
data only; generated callbacks are explicit safe previews, not business logic.
No normal user profile, Docker, system service or global SDK is required by the
native consumer test.

See the [application guide](../native-application.md) for usage, boundaries,
component/file responsibilities and primary Electron references. Existing
screen-reader/manual accessibility checks remain explicitly unperformed until
there is real evidence for them.
