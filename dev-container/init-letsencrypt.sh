#!/usr/bin/env bash
set -euo pipefail

# Obtain (or renew) the Let's Encrypt certificate for the site.
# Run after `docker compose up` (nginx must be serving the ACME webroot on :80).

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

COMPOSE_FILE="dev-container/docker-compose.prod.yml"
DOMAIN="${DOMAIN:-vanalume.com}"
EMAIL="${EMAIL:-vanalume@vanalume.com}"

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }

say() { printf "\033[1;34m==>\033[0m %s\n" "$*"; }

say "removing any placeholder cert so certbot can write the real one"
compose exec -T frontend sh -c "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf" || true

say "requesting certificate for $DOMAIN (webroot)"
compose run --rm certbot certonly --webroot -w /var/www/certbot \
  -d "$DOMAIN" \
  --email "$EMAIL" --agree-tos --no-eff-email \
  --keep-until-expiring --expand

say "reloading nginx with the new certificate"
compose exec -T frontend nginx -s reload

say "SSL certificate ready for $DOMAIN"
