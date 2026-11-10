# Documentation refresh — 2026-11-09

By Jason Stys.

This documentation-only edition describes source `bd689a5a8b119ed629905f65d90d097ae16acd0e`. It does not change application behavior, accounts, private data, installers or published releases.

## Published editions and completed review

| File                                     | Bytes | SHA-256                                                            | Reviewed scope                    |
| ---------------------------------------- | ----: | ------------------------------------------------------------------ | --------------------------------- |
| [project-guide.docx](project-guide.docx) | 45574 | `c2c3dfc033caf96971d9a189daa179266447a1929af4ec530e6df436f501a388` | 6 pages, each viewed individually |

Word review checked plain black titles, readable pagination, whole table rows, source references, practical limits and absence of clipping or overflow. Render receipts were matched to the current DOCX digest before approval.

## Evidence and change boundary

- Functional baseline: `bd689a5a8b119ed629905f65d90d097ae16acd0e`.
- Workflow observation: `2026-11-10T05:25:40.628667+00:00`; exact run URLs and source identities remain in [publications.json](publications.json).
- Local document-package validation verifies exact copied bytes, Office ZIP integrity, approved page/tab identities and internal documentation links. Repository-specific documentation and source-policy commands are run separately and recorded in the integration handoff.
- Source/index metadata is regenerated using the repository’s existing tools. Existing privacy, security, coverage and workflow gates are retained.
- PR and later main workflows must pass independently. This record does not claim future or unrun integration CI success.

## Interpretation

The Word files document the cited source; dated source reports retain their original execution scope. A passing workflow is distinct from completed analysis with zero findings, and neither establishes production suitability. Checksums identify exact bytes, not a signature or publisher attestation.

Use the [handbook](../handbook.md) to choose usage, design, security and test documentation. Keep editable Markdown and reviewed editions together; do not replace historical measurements with undated claims.

## Actual integration validation

The complete unchanged npm run verify passed: formatting, strict lint/types, 23 UI unit tests (99.28% lines, 94.58% branches), production/library/Storybook builds, bundle budget, actual installed TGZ consumer exercised in Chromium, exact symbol index and repository policy. The additive Office-input lane passed 24 real ZIP/descriptor cases; its POSIX FIFO case is explicitly skipped on Windows and remains required on the hosted Linux lanes. No app runtime/package exports or released bytes were changed.

The existing content-policy checker now inspects actual XML and relationships from the exact reviewed `docs/reports/project-guide.docx` instead of applying its regexes to compressed binary bytes. Ordinary source retains scanning and now uses strict UTF-8 with an 8 MiB descriptor-read limit. The conventional single-disk ZIP reader requires regular files, nonblocking opening where supported, at most 256 unique members, an 8 MiB expansion budget and a 2 MiB XML/member limit. Central and local names, methods, flags, CRC and sizes must agree; every inflated member CRC is verified. Macros, embedded payloads, encryption, ZIP64/split archives and data-descriptor members are unsupported and rejected. No XML is executed or external relationship fetched.

Independent stored/deflated fixtures cover missing/duplicate/path-invalid parts, mismatched records, invalid UTF-8, CRC errors and dishonest inflation sizes. The original repository secret/reference patterns still run over the decoded XML and relationships. This is a development-time publication policy, not a general-purpose DOCX renderer or a change to the distributed React library. Exact-source hosted checks remain required.
