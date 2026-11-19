# PostgreSQL et PostGIS en local

[English](local-database.md)

Depuis la racine du dépôt, définissez un mot de passe local avec `$env:POSTGRES_PASSWORD = '<mot-de-passe-local>'` dans PowerShell ou `export POSTGRES_PASSWORD='<mot-de-passe-local>'` dans Bash. Docker Compose utilise la même image Linux PostgreSQL 18 / PostGIS 3.6 figée par empreinte qu’en CI. Le port local est 55432, configurable via `POSTGRES_PORT`. Le volume Docker conserve les données entre deux démarrages.

```sh
docker compose up -d --wait db
docker compose exec -T db psql -X -U georeference_test -d places_dev -f /workspace/database/bootstrap.sql
docker compose exec -T db psql -X -U georeference_test -d places_dev -f /workspace/database/migrate.sql
docker compose exec -T db bash /workspace/database/test.sh
docker compose stop db
```

L’administrateur initialise un cluster de développement dédié. Le script active PostGIS et crée trois rôles collectifs sans mot de passe. Le compte local du conteneur administre le cluster. Accordez à chaque futur compte applicatif uniquement le rôle requis. Les migrations créent les tables sous `places_migrator`, propriétaire des schémas. Les droits par défaut accordent la lecture et l’écriture des nouvelles tables éditoriales à `places_editor`, et la lecture des nouvelles tables publiées à `places_reader`. Le lecteur ne peut pas accéder au schéma éditorial.

Ajoutez chaque migration SQL numérotée dans l’ordre dans `database/migrate.sql`. Gardez immuables les versions déjà appliquées. Un verrou transactionnel sérialise les migrations sur une base. La modification du schéma et son inscription au registre sont validées ensemble. Après une erreur, corrigez la migration en attente et relancez la commande.

Le test crée des bases jetables, vérifie la concurrence et les permissions, sauvegarde des données fictives avec `pg_dump -Fc` et les restaure avec `pg_restore --exit-on-error` dans une base créée depuis `template0`. Il vérifie les données et les droits restaurés avant nettoyage. Pour restaurer sur un nouveau cluster, créez d’abord les rôles collectifs et vérifiez la disponibilité de la même extension PostGIS. Après restauration, relancez le script bootstrap pour accorder les droits sur la base cible, puis relancez les migrations. Conservez sauvegardes et identifiants réels hors de Git.

La cible hébergée est Render Managed PostgreSQL. Lors du provisionnement, vérifiez la version d’extension proposée pour la version majeure choisie et les privilèges d’initialisation du compte Render. L’API utilise encore son catalogue embarqué. [Extensions Render](https://render.com/docs/postgresql-extensions)
