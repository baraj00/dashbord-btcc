#!/bin/sh
set -e

# Support both DATABASE_URL (Fly.io) and individual DB_* vars (Docker Compose)
if [ -n "$DATABASE_URL" ]; then
  # Extract connection parts from DATABASE_URL for pg_isready
  DB_HOST=$(echo "$DATABASE_URL" | sed -E 's|postgres://[^@]+@([^:/]+).*|\1|')
  DB_PORT=$(echo "$DATABASE_URL" | sed -E 's|postgres://[^@]+@[^:]+:([0-9]+).*|\1|')
  DB_USER=$(echo "$DATABASE_URL" | sed -E 's|postgres://([^:]+):.*|\1|')
  PSQL_CONN="$DATABASE_URL"
else
  DB_HOST="${DB_HOST:-localhost}"
  DB_PORT="${DB_PORT:-5432}"
  DB_USER="${DB_USER:-btcc}"
  PSQL_CONN="postgresql://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${DB_PORT}/${DB_NAME}"
fi

echo "Waiting for PostgreSQL..."
until pg_isready -h "$DB_HOST" -p "${DB_PORT:-5432}" -U "$DB_USER" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL ready."

# Apply migrations (|| true so that "already exists" NOTICEs don't abort)
echo "Applying migrations..."
for f in migrations/*.sql; do
  echo "  Running $f..."
  psql "$PSQL_CONN" -f "$f" || true
done
echo "Migrations done."

exec node dist/src/index.js
