#!/bin/sh
set -e

# Wait for postgres to be ready
echo "Waiting for PostgreSQL..."
until pg_isready -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" > /dev/null 2>&1; do
  sleep 1
done
echo "PostgreSQL ready."

# Apply migrations (|| true so that "already exists" NOTICEs don't abort)
echo "Applying migrations..."
for f in migrations/*.sql; do
  echo "  Running $f..."
  PGPASSWORD="$DB_PASSWORD" psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -f "$f" || true
done
echo "Migrations done."

# Start indexer
exec node dist/src/index.js
