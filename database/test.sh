#!/usr/bin/env bash
# Integration checks inside the disposable Compose development or CI cluster.
set -euo pipefail
cd /workspace/database
export PGUSER="$POSTGRES_USER"
scratch=$(mktemp -d)
export PGDATABASE="places_test_${scratch##*.}"
restored="${PGDATABASE}_restore"
reader="${PGDATABASE}_reader"
archive="$scratch/test.dump"
cleanup() {
  if [[ -e "$scratch/restore-created" ]]; then dropdb "$restored"; fi
  if [[ -e "$scratch/db-created" ]]; then dropdb "$PGDATABASE"; fi
  if [[ -e "$scratch/role-created" ]]; then dropuser "$reader"; fi
  rm -f "$archive" "$scratch/restore-created" "$scratch/db-created" "$scratch/role-created"
  rmdir "$scratch"
}
trap cleanup EXIT
createdb --template=template0 "$PGDATABASE"
touch "$scratch/db-created"
sql() { psql -X -v ON_ERROR_STOP=1 "$@"; }
value() { sql -Atqc "$1"; }
# The bootstrap runs separately from the transactional migration runner.
sql -f bootstrap.sql
[[ "$(value "SELECT EXISTS (SELECT FROM pg_extension WHERE extname='postgis')")" == t ]] || {
  echo "Expected PostGIS in the empty application database" >&2; exit 1;
}
# Force a collision late in migration 001 and verify transactional rollback.
sql -c 'CREATE SCHEMA published AUTHORIZATION places_migrator'
if sql -f migrate.sql; then echo 'Expected migration failure' >&2; exit 1; fi
[[ "$(value "SELECT to_regnamespace('editorial') IS NULL")" == t ]]
sql -c 'DROP SCHEMA published'
sql -f migrate.sql & first=$!
sql -f migrate.sql & second=$!
wait "$first"
wait "$second"
sql -f migrate.sql
[[ "$(value "SELECT count(*) FROM migration.applied WHERE version='001'")" == 1 ]]
sql <<'SQL'
SET ROLE places_migrator;
CREATE TABLE editorial.probe (id integer PRIMARY KEY);
CREATE TABLE published.probe (position geometry(Point,4326));
INSERT INTO published.probe VALUES (ST_SetSRID(ST_Point(15,-4),4326));
SET ROLE places_editor;
INSERT INTO editorial.probe VALUES (1);
SQL
createuser --login --no-superuser --no-createrole --no-createdb --member-of=places_reader "$reader"
touch "$scratch/role-created"
[[ "$(PGUSER="$reader" value 'SELECT ST_X(position) FROM published.probe')" == 15 ]]
for query in 'SELECT * FROM editorial.probe' 'INSERT INTO published.probe VALUES (NULL)' 'INSERT INTO editorial.probe VALUES (2)'; do
  if PGUSER="$reader" sql -c "$query"; then echo "Unexpected reader privilege" >&2; exit 1; fi
done
pg_dump -Fc -f "$archive" "$PGDATABASE"
createdb --template=template0 "$restored"
touch "$scratch/restore-created"
pg_restore --exit-on-error -d "$restored" "$archive"
PGDATABASE="$restored" sql -f bootstrap.sql
PGDATABASE="$restored" sql -f migrate.sql
[[ "$(PGDATABASE="$restored" value 'SET ROLE places_editor; SELECT id FROM editorial.probe')" == 1 ]]
[[ "$(PGDATABASE="$restored" value 'SET ROLE places_reader; SELECT ST_Y(position) FROM published.probe')" == -4 ]]
echo "Migration, privileges and restore checks passed"
