#!/usr/bin/env bash
set -o errexit -o nounset -o pipefail

npm run prettier-check
npx --no playwright install --with-deps chromium
npx --no playwright test "$@"