#!/bin/sh
set -e

# Use DATABASE_URL if available, otherwise build from individual vars
if [ -n "$DATABASE_URL" ]; then
  PSQL_CONN="$DATABASE_URL"
else
  PSQL_CONN="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT:-5432}/${DB_NAME}"
fi

echo "Waiting for PostgreSQL..."
until psql "$PSQL_CONN" -c '\q' > /dev/null 2>&1; do
  sleep 2
done
echo "PostgreSQL ready."

# Apply migrations (|| true so that "already exists" notices don't abort)
echo "Applying migrations..."
for f in migrations/*.sql; do
  echo "  Running $f..."
  psql "$PSQL_CONN" -f "$f" || true
done
echo "Migrations done."

exec node dist/src/index.js
