#!/usr/bin/env bash

set -e

if [[ -z "${HOST}" ]]; then
  echo "Environment variable HOST not defined"
  exit 1
fi

if [[ -z "${AOE_ADMIN_PASS}" ]]; then
  echo "Environment variable AOE_ADMIN_PASS not defined"
  exit 1
fi

if [[ -z "${REPORTER_PASS}" ]]; then
  echo "Environment variable REPORTER_PASS not defined"
  exit 1
fi

DB_NAME=${DB_NAME:-aoe}

echo "Connecting to host ${HOST}, database is ${DB_NAME}"

psql -v ON_ERROR_STOP=1 --username aoe_db_admin --dbname postgres --host "$HOST" <<-EOSQL
    CREATE DATABASE aoe ENCODING "UTF-8";
EOSQL

psql -v ON_ERROR_STOP=1 --username aoe_db_admin --dbname "$DB_NAME" --host "$HOST" <<-EOSQL
    CREATE USER aoe_admin PASSWORD ''$AOE_ADMIN_PASS'';
    CREATE USER aoe_db_admin PASSWORD ''$AOE_DB_ADMIN_PASS'';
    CREATE USER reporter PASSWORD ''$REPORTER_PASS'';

    GRANT ALL PRIVILEGES ON DATABASE aoe TO aoe_admin;
    GRANT ALL PRIVILEGES ON DATABASE aoe TO aoe_db_admin;
    GRANT SELECT ON ALL TABLES IN SCHEMA public TO reporter;
EOSQL
