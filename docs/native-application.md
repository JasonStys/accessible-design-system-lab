# Accessible Design Studio

Created by Jason Stys · application/library 1.1.0 · Windows x64 portable candidate.

The application contains the complete existing React component catalog and a real
blueprint authoring workspace. It uses the actual public Button, TextField,
Combobox, DataTable, Tabs and Dialog implementations. Prepared service-intake,
operations-review and preferences designs are editable input documents inside
the full application, rather than separate sample applications.

## Use a blueprint

1. Choose prepared input or edit the complete design JSON. Every field has a
   closed schema; at most 20 blocks, 6 table columns, 50 table rows and 64 KiB of
   UTF-8 project input are accepted. No imported JavaScript, HTML, CSS, URL or
   callback is executed.
2. Validate and apply the preview. A rejected edit keeps your last good preview
   and durable saved project. Save/export remain disabled until the draft and
   preview match. Use the palette, selected-block editor, Move up/down and Remove
   controls to organize the design.
3. Use the real interactions: type into fields, filter/select choices, sort and
   page tables, navigate tabs by keyboard, and open a native modal with focus
   return. Buttons announce preview activation; they do not submit a real form
   or change an account. Each applied block intentionally resets its preview
   input/interaction state; entered preview values are not stored in the project.
4. In the desktop application, Load saved project once before Save to obtain the
   current local revision. Save is explicit and refuses an obsolete revision.
   Preparing/importing/applying data does not overwrite durable state. One current
   design and its previous complete saved revision are retained in each profile.
5. Export JSON to edit/import later, or export React and CSS together for a real
   React/TypeScript project with this library installed. A CSS-aware bundler/type
   environment, such as Vite's standard client declarations, is required. Generated
   callbacks are safe preview logic; add and test your own reviewed business logic.
   Exported literal text cannot become executable JSX. Existing destinations are
   refused, including after a repeated export.
6. Quit through the application button, Application menu or window close control.
   The owner remains visible while accepted file/dialog work completes and releases
   its lock only afterward. A test deadline does not guarantee a universal shutdown
   time. Browser mode offers the same authoring/preview/exports in memory, while
   durable local storage and native file dialogs belong to the downloadable app.

The accent control is a typed six-digit color in the design JSON. The preview and
export choose black or white primary-button text by actual sRGB contrast and
report the measured ratio. Other text, focus, states, layout, assistive technology
and usability still require review; this is not an accessibility certification.

## Install and retain private work

After an accepted release is published, download its complete Windows ZIP and
sidecar, verify SHA-256, extract the entire directory and open
`AccessibleDesignStudio.exe`. The bundled runtime needs no installed Node, Python,
IDE or commands. Keep adjacent resources together. This is an unsigned portable
application, not an MSI/Store installer, clean-machine certification or tested
native package for another operating system.

The default Windows data directory is
`%LOCALAPPDATA%/JasonStysPortfolio/accessible-design-system-lab/workspace`.
An explicit final `--profile ABSOLUTE_DIRECTORY` selects another empty or identified
workspace. Application/resource directories, unknown nonempty directories,
pre-existing aliases/junctions and hardlinked state files are refused before
initialization. All new exports use exclusive new-file writes. File reads retain
one bounded regular descriptor and bind its identity before consuming bytes.

Project JSON, its previous revision and exported text are plaintext under one
trusted OS owner. This is not a multi-user authentication or encrypted-vault
boundary. Hashes and markers do not authenticate a malicious same-owner writer;
static admission does not protect a concurrent namespace race. Copy the complete
profile only after a normal exit. A retained owner lock or interrupted temporary
file is preserved for manual review, never automatically deleted or adopted.
Do not remove another running instance's lock. Chromium cache is separately owned
temporary data, not the durable blueprint.

## Architecture and verification

| File                              | Responsibility                                                                                                                |
| --------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| `src/authoring/project.ts`        | Closed typed schema, real prepared inputs, palette, safe literal React/CSS generation and measured button contrast.           |
| `src/authoring/Workspace.tsx`     | Explicit edited/applied/saved states, real component preview, import/export, outline and contextual help.                     |
| `desktop/profile.cjs`             | Identified owner-local profile, stale-revision refusal, complete previous revision and no silent reset.                       |
| `desktop/files.cjs`               | Same-descriptor bounded reads, alias refusal, strict UTF-8 and exclusive flushed new-file export.                             |
| `desktop/assets.cjs`              | Verify and preload fixed public assets; no private files or RPC endpoints are served.                                         |
| `desktop/main.cjs`, `preload.cjs` | Owned-frame narrow IPC, sandbox/context isolation, direct-only network policy and retained local-work lifecycle.              |
| `scripts/build-native.mjs`        | Fresh source-bound complete application with actual project/React/Electron notices and a distinct authored icon.              |
| `scripts/archive_native.py`       | Bounded Windows ZIP, safe complete relocation and actual native consumer. Python is build-only.                               |
| `scripts/test-native-app.mjs`     | Actual authoring, real controls, file operations, held export/repeated Close and two durable normal launches.                 |
| `scripts/package-smoke.mjs`       | Independent installed-TGZ consumer, strict compilation of five generated variants and actual generated-component browser use. |

The renderer has no Node or direct filesystem access. IPC requires the exact
owned main frame. The numeric-loopback HTTP listener exposes only verified public
website bytes, never profile data. It has no private HTTP API. Outside requests,
popups, permissions and navigation are refused; direct browser proxy policy is
explicit. Imported text is rendered as data. ASAR's own already-executing module
bytes use its virtual filesystem for provenance checks; user-selected files use
the separate regular-descriptor boundary. Checksums are not signatures.

Build with locked root/desktop dependencies and an explicit official Electron
download, then set `ADS_NATIVE_OUTPUT=release/NEW_DIRECTORY` and run
`node scripts/build-native.mjs`. Use `python scripts/archive_native.py
release/NEW_DIRECTORY/win-unpacked artifacts/native/NEW_PROOF` to relocate the
complete ZIP and exercise the actual executable. Use fresh output paths. Local
candidates disclose dirty source; hosted candidates require a clean exact SHA.
The CI job stores bounded receipts/screenshots by default; retaining the complete
unsigned package requires explicit trusted-main manual opt-in.

Primary references: [Electron security](https://www.electronjs.org/docs/latest/tutorial/security),
[context isolation](https://www.electronjs.org/docs/latest/tutorial/context-isolation),
[sandboxed renderers](https://www.electronjs.org/docs/latest/tutorial/sandbox).
