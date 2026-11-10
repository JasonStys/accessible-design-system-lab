# Accessible Design System Lab handbook

By Jason Stys.

Use accessible table sorting, paging, stable missing-value ordering and focus handling. Final TGZ acceptance now installs the actual public package into an external React/Vite consumer and exercises shipped behavior, CSS and accessibility in Chromium.

Use accessible table sorting, paging, stable missing-value ordering and focus handling. Final TGZ acceptance now installs the actual public package into an external React/Vite consumer and exercises shipped behavior, CSS and accessibility in Chromium.

Proves that the packaged public exports work in a genuine separate consumer instead of passing because export names appear in JavaScript text.

## Read the documentation

| Edition                                          | Audience and contents                                                                       |
| ------------------------------------------------ | ------------------------------------------------------------------------------------------- |
| [project-guide.docx](reports/project-guide.docx) | User and developer guide: purpose, current usage, design, boundaries and source references. |

The editable Markdown remains the maintenance source. The Word files are readable editions. See [publication identities and review](reports/publications.json) and the [documentation refresh record](reports/documentation-refresh-2026-11-09.md).

## Current usage and help

[README quick start](../README.md) is the entry point. Use the project-specific guides below before changing inputs, operating modes or deployment assumptions.

### Usage and operations

- [operations](operations.md)

### Design and contracts

- [adr/0001 native first react and css](adr/0001-native-first-react-and-css.md)
- [api](api.md)
- [architecture](architecture.md)
- [complexity](complexity.md)
- [research](research.md)

### Security and validation

- [testing](testing.md)

## Historical results and reproduction

The reviewed source is [`bd689a5a8b119ed629905f65d90d097ae16acd0e`](https://github.com/JasonStys/accessible-design-system-lab/tree/bd689a5a8b119ed629905f65d90d097ae16acd0e). The observed functional workflow baseline is `bd689a5a8b119ed629905f65d90d097ae16acd0e`; those observations are recorded at `2026-11-10T05:25:40.628667+00:00`. They do not certify an unrun later revision.

- [Detailed recorded validation](reports/installed-consumer-2026-11-09.md)
- [Current Actions](https://github.com/JasonStys/accessible-design-system-lab/actions) records later integration checks separately.
- Preserve dated measurements and follow the existing testing guide to reproduce them; a test-source inventory alone does not establish execution.

## Practical boundaries

- An installable component library and catalog, without automatic npm publication or a native desktop installer.
- Synthetic component/browser checks and zero automated axe findings do not certify accessibility or replace manual assistive-technology testing.
- Archive integrity and locked peers identify tested bytes, not independently authenticated publishers or OS code signatures.

## Maintaining these editions

Update the editable usage/design/test documents first. Rebuild and visually review every Word page and workbook tab before replacing an edition; verify the exact binary digests and evidence source in publications.json. Keep account data, logs with secrets, installed-app state and private test stores out of documentation. Source and release assets retain their existing security and licensing boundaries.
