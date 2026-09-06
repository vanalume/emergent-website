#!/usr/bin/env bash
set -euo pipefail

# Vanalume production deploy script (Hostinger VPS, Ubuntu + Docker).
# Safe to run from anywhere — it resolves its own directory.
#
# Usage:
#   ./deploy.sh               full deploy: git pull + build + start + healthcheck
#   ./deploy.sh --no-pull     deploy without git pull
#   ./deploy.sh health        healthcheck only

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="dev-container/docker-compose.prod.yml"
BASE_URL="${BASE_URL:-https://localhost}"

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }
say() { printf "\033[1;34m==>\033[0m %s\n" "$*"; }
die() { printf "\033[1;31mERROR\033[0m %s\n" "$*" >&2; exit 1; }

usage() {
  cat <<'EOF'
Usage:
  ./deploy.sh               full deploy: git pull + build + start + healthcheck
  ./deploy.sh --no-pull     deploy without git pull
  ./deploy.sh health        healthcheck only
EOF
}

check_env() {
  [ -f backend/.env ] || die "backend/.env not found — run: cp backend/.env.sample backend/.env (then fill in values)"
}

git_pull() {
  if [ -d .git ] && command -v git >/dev/null 2>&1; then
    say "git pull"
    git pull --ff-only
  else
    say "no git repo detected — skipping pull"
  fi
}

wait_for_url() {
  local url="$1" timeout="${2:-60}" elapsed=0
  until curl -kfsS -o /dev/null "$url"; do
    elapsed=$((elapsed + 2))
    [ "$elapsed" -ge "$timeout" ] && return 1
    sleep 2
  done
}

healthcheck() {
  say "health check against $BASE_URL"

  if wait_for_url "$BASE_URL/" 90; then say "frontend ($BASE_URL/): OK"; else die "frontend not healthy"; fi
  if wait_for_url "$BASE_URL/api/" 180; then say "backend ($BASE_URL/api/): OK"; else die "backend not healthy — run: docker compose -f $COMPOSE_FILE logs backend"; fi

  if wait_for_url "$BASE_URL/api/products" 60; then
    say "catalogue ($BASE_URL/api/products): OK (DB reachable, seed complete)"
  else
    say "catalogue: FAIL — check logs (make logs-backend)"
  fi
}

PULL=true
case "${1:-}" in
  health)
    check_env
    healthcheck
    exit 0
    ;;
  --no-pull)
    PULL=false
    ;;
  -h|--help)
    usage
    exit 0
    ;;
  *)
    ;;
esac

check_env
if [ "$PULL" = "true" ]; then git_pull; fi
say "build + start ($COMPOSE_FILE)"
compose up -d --build

say "TLS certificate (Let's Encrypt)"
if [ -x "$SCRIPT_DIR/dev-container/init-letsencrypt.sh" ]; then
  bash "$SCRIPT_DIR/dev-container/init-letsencrypt.sh" || say "certbot step failed — continuing with the placeholder cert"
fi

healthcheck
say "deploy complete"
compose ps
