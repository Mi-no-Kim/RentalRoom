#!/usr/bin/env bash
set -euo pipefail

area="${1:?area is required}"
event="${2:?event is required}"
base="${3:-}"
head="${4:-}"

case "$area" in
  frontend|backend) ;;
  *) echo "Unknown area: $area" >&2; exit 1 ;;
esac

if [[ "$event" != pull_request ]]; then
  printf 'true\n'
  exit 0
fi

if [[ -z "$base" || -z "$head" ]]; then
  echo 'Pull request base and head SHAs are required' >&2
  exit 1
fi

changed_files=$(mktemp)
trap 'rm -f "$changed_files"' EXIT
git diff --name-only --no-renames -z "$base" "$head" -- > "$changed_files"

should_run=false
while IFS= read -r -d '' path; do
  case "$path" in
    frontend/*|package.json|package-lock.json)
      if [[ "$area" == frontend ]]; then should_run=true; fi
      ;;
    backend/*)
      if [[ "$area" == backend ]]; then should_run=true; fi
      ;;
    docs/*|*.md)
      ;;
    *)
      should_run=true
      ;;
  esac
done < "$changed_files"

printf '%s\n' "$should_run"
