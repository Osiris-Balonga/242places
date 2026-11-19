\set ON_ERROR_STOP on
BEGIN;
SELECT pg_advisory_xact_lock(24250, 1);
CREATE EXTENSION IF NOT EXISTS postgis;

-- Group roles are cluster-wide. Run as the administrator of the dedicated cluster.
SELECT format('CREATE ROLE %I NOLOGIN', name)
FROM (VALUES ('places_migrator'), ('places_editor'), ('places_reader')) AS roles(name)
WHERE NOT EXISTS (SELECT FROM pg_roles WHERE rolname = name)
\gexec

GRANT places_migrator TO CURRENT_USER;
SELECT format('GRANT CREATE ON DATABASE %I TO places_migrator', current_database())
\gexec
COMMIT;
