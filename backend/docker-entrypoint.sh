#!/bin/sh
set -e
MAX_RETRIES=30
COUNT=0
until npx prisma migrate deploy; do
  COUNT=$((COUNT + 1))
  if [ "$COUNT" -ge "$MAX_RETRIES" ]; then
    echo "Base injoignable après $MAX_RETRIES tentatives."
    exit 1
  fi
  echo "DB pas prête (tentative $COUNT/$MAX_RETRIES), retry dans 2s..."
  sleep 2
done
exec node dist/main