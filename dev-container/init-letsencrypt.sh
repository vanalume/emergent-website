#!/usr/bin/env bash
set -euo pipefail

# Obtain (first run) or renew the Let's Encrypt certificate for the site.
# Safe to run repeatedly (and from cron) — it only issues a fresh cert when a
# self-signed placeholder is still present; otherwise it runs `certbot renew`,
# which is a no-op unless the cert is near expiry.

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# This script lives in dev-container/, so the compose file is a sibling.
COMPOSE_FILE="docker-compose.prod.yml"
DOMAIN="${DOMAIN:-vanalume.com}"
EMAIL="${EMAIL:-vanalume@vanalume.com}"

compose() { docker compose -f "$COMPOSE_FILE" "$@"; }
say() { printf "\033[1;34m==>\033[0m %s\n" "$*"; }

CERT_PATH="/etc/letsencrypt/live/$DOMAIN/fullchain.pem"

# Real certs are issued by "Let's Encrypt"; the boot placeholder is "CN=vanalume.com".
is_real() {
  compose exec -T frontend sh -c \
    "test -f '$CERT_PATH' && openssl x509 -in '$CERT_PATH' -noout -issuer | grep -qi 'Encrypt'"
}

if is_real; then
  say "certificate already issued — renewing if near expiry"
  compose run --rm certbot renew
else
  say "no real certificate yet — removing placeholder and issuing for $DOMAIN + www.$DOMAIN"
  compose exec -T frontend sh -c \
    "rm -rf /etc/letsencrypt/live/$DOMAIN /etc/letsencrypt/archive/$DOMAIN /etc/letsencrypt/renewal/$DOMAIN.conf" || true
  compose run --rm certbot certonly --webroot -w /var/www/certbot \
    -d "$DOMAIN" -d "www.$DOMAIN" \
    --email "$EMAIL" --agree-tos --no-eff-email --expand
fi

say "reloading nginx"
compose exec -T frontend nginx -s reload

say "certificate ready for $DOMAIN + www.$DOMAIN"
