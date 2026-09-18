# Complexity and performance

| Operation                      |       Time |      Space | Notes                                            |
| ------------------------------ | ---------: | ---------: | ------------------------------------------------ |
| Button/TextField/Dialog render |     `O(1)` |     `O(1)` | Fixed element count, excluding caller children   |
| Tabs render                    |     `O(n)` |     `O(n)` | One button per tab and a ref map                 |
| Tab keyboard navigation        |     `O(1)` |     `O(1)` | Index arithmetic plus map lookup                 |
| Combobox filter                | `O(n × m)` |     `O(n)` | `n` options, average normalized label length `m` |
| Combobox keyboard move         |     `O(1)` |     `O(1)` | Bounded index arithmetic                         |
| Toast render                   |     `O(n)` |     `O(n)` | Stable ordered messages                          |
| DataTable render               | `O(r × c)` | `O(r × c)` | Rows times columns                               |

The current combobox targets small static option collections. At sustained collections above roughly
200 items or remote datasets, measure first, then introduce debounced server filtering and
virtualization while retaining active-descendant semantics.

The package gzip budgets are 36 KB JavaScript and 16 KB CSS. `scripts/check-bundle.mjs` fails when
either boundary is crossed and emits machine-readable evidence.
