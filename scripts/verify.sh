#!/usr/bin/env bash
# File: verify.sh
# Purpose: Run the deterministic local verification sequence used by contributors and CI.
# Important variables: repository_root anchors every command to the checkout rather than caller state.
set -euo pipefail

repository_root="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$repository_root"

npm ci
npm run verify
