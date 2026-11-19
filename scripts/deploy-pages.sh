#!/usr/bin/env bash
# Build for GitHub Pages and force-push dist/ to the gh-pages branch.
# Usage: npm run deploy
set -euo pipefail

REPO_URL="$(git remote get-url origin)"
export BASE_PATH="/portfolio/"
export SITE_URL="https://chetan314.github.io/portfolio"

npm run build
touch dist/.nojekyll

cd dist
rm -rf .git
git init -q
git checkout -q -b gh-pages
git add -A
git commit -q -m "Deploy $(git -C .. rev-parse --short HEAD)"
git push -q -f "$REPO_URL" gh-pages
rm -rf .git
echo "Deployed → $SITE_URL/"
