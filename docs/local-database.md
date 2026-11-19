# Local PostgreSQL and PostGIS

[Français](local-database.fr.md)

From the repository root, set `POSTGRES_PASSWORD` to a local-only value in your shell (PowerShell: `$env:POSTGRES_PASSWORD = '<local-password>'`, Bash: `export POSTGRES_PASSWORD='<local-password>'`). The Docker Compose service uses the same digest-pinned PostgreSQL 18 / PostGIS 3.6 Linux image as CI. The database listens on loopback port 55432. Override `POSTGRES_PORT` if needed. Docker retains the database in its project volume between restarts.

```sh
docker compose up -d --wait db
docker compose exec -T db psql -X -U georeference_test -d places_dev -f /workspace/database/bootstrap.sql
docker compose exec -T db psql -X -U georeference_test -d places_dev -f /workspace/database/migrate.sql
docker compose exec -T db bash /workspace/database/test.sh
docker compose stop db
```

Bootstrap is an administrator operation on a dedicated development cluster. It enables PostGIS and creates three group roles without passwords. The local container account is the development administrator. Give any future application login only its required group membership. The migration script switches to `places_migrator`, which owns the application schemas and creates tables. New editorial tables allow `places_editor` to read and write. New published tables allow `places_reader` to read. The reader has no access to the editorial schema. Run future schema changes as the migrator so these default privileges apply.

Add each numbered SQL migration to the ordered dispatch in `database/migrate.sql`. Keep applied versions immutable. An advisory transaction lock serializes runners on one database. Schema changes and ledger entries commit together. After an error, correct the pending migration and rerun the same command.

The integration test creates disposable databases, migrates concurrently, exercises privileges, dumps synthetic records with `pg_dump -Fc`, and restores with `pg_restore --exit-on-error` into a new database from `template0`. It checks both data and permissions before cleaning up. For a restore to a fresh cluster, create the group roles first and use a server with the matching PostGIS extension available. After restoring into a named database, rerun bootstrap to grant database-level privileges on that target, then rerun migrations. Keep dumps and real credentials outside Git.

The hosted target is Render Managed PostgreSQL. When provisioning is approved, verify the available extension version on the selected PostgreSQL major and run the administrator bootstrap with the provider's supported privileges. The current API still reads its bundled dataset. [Supported Render extensions](https://render.com/docs/postgresql-extensions)
