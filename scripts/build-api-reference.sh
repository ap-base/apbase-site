#!/usr/bin/env bash
# Builds the API reference (Sphinx autodoc over the installed apbase package) into out/api/.
# The rest of the docs is rendered by Next.js; only docs/api/ goes through Sphinx, with api/ as its root.
#
# Usage: scripts/build-api-reference.sh <path-to-apbase-docs-checkout> [out-dir]
# Requires: pip install -r <apbase-docs>/requirements-docs.txt and the apbase package.
set -euo pipefail

DOCS_REPO="${1:?usage: $0 <path-to-apbase-docs> [out-dir]}"
OUT_DIR="${2:-out/api}"
SRC="$DOCS_REPO/docs"

WORK="$(mktemp -d)"
trap 'rm -rf "$WORK"' EXIT

# Shared Sphinx config and assets, then the API pages at the root (api/index.md becomes the landing page).
cp -r "$SRC/conf.py" "$WORK/"
for extra in _static _templates img references.bib robots.txt; do
  if [ -e "$SRC/$extra" ]; then cp -r "$SRC/$extra" "$WORK/"; fi
done
cp -r "$SRC/api/." "$WORK/"

sphinx-build -b html -W --keep-going -q \
  -D html_baseurl=https://apbase.io/api/ \
  "$WORK" "$WORK/_build"

# The site serves its own robots.txt and sitemap.xml at the root.
rm -f "$WORK/_build/robots.txt" "$WORK/_build/sitemap.xml"
rm -rf "$WORK/_build/.doctrees" "$WORK/_build/.buildinfo"

rm -rf "$OUT_DIR"
mkdir -p "$(dirname "$OUT_DIR")"
cp -r "$WORK/_build" "$OUT_DIR"
echo "API reference: $(find "$OUT_DIR" -name '*.html' | wc -l) pages in $OUT_DIR"
