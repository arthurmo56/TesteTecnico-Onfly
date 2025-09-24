#!/bin/bash
set -e

echo "Starting database initialization..."

if [ -n "${POSTGRES_NON_ROOT_USER:-}" ] && [ -n "${POSTGRES_NON_ROOT_PASSWORD:-}" ]; then
	echo "Creating user: ${POSTGRES_NON_ROOT_USER}"
	psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$POSTGRES_DB" <<-EOSQL
		CREATE USER "${POSTGRES_NON_ROOT_USER}" WITH PASSWORD '${POSTGRES_NON_ROOT_PASSWORD}';
		GRANT ALL PRIVILEGES ON DATABASE "${POSTGRES_DB}" TO "${POSTGRES_NON_ROOT_USER}";
		GRANT CREATE ON SCHEMA public TO "${POSTGRES_NON_ROOT_USER}";
		ALTER USER "${POSTGRES_NON_ROOT_USER}" CREATEDB;
	EOSQL
	echo "User ${POSTGRES_NON_ROOT_USER} created successfully!"
else
	echo "SETUP INFO: No Environment variables given!"
fi