#!/usr/bin/env bash
set -e
URL="${1:-https://padelhere.onrender.com/health}"
RETRIES=15
DELAY=10

echo "Iniciando healthcheck contra $URL ..."
for i in $(seq 1 $RETRIES); do
  STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$URL" || true)
  if [ "$STATUS" -eq 200 ]; then
    echo "Servicio activo (HTTP 200)."
    exit 0
  fi
  echo "Intento $i/$RETRIES: status $STATUS. Esperando $DELAY s..."
  sleep $DELAY
done
echo "Error: el servicio no respondio con HTTP 200 tras $RETRIES intentos."
exit 1
