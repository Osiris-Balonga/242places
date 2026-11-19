\set ON_ERROR_STOP on
BEGIN;
SET LOCAL ROLE places_migrator;
-- Serialize the ledger check and all pending DDL on the same connection.
SELECT pg_advisory_xact_lock(24250, 1);
CREATE SCHEMA IF NOT EXISTS migration;
CREATE TABLE IF NOT EXISTS migration.applied (
    version text PRIMARY KEY,
    applied_at timestamptz NOT NULL DEFAULT now()
);

SELECT NOT EXISTS (SELECT FROM migration.applied WHERE version = '001') AS pending
\gset
\if :pending
    \ir migrations/001_roles_and_schemas.sql
    INSERT INTO migration.applied (version) VALUES ('001');
\endif
COMMIT;
