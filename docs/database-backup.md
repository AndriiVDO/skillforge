# PostgreSQL Backup and Restore

This guide creates a database backup and verifies restoration into a
separate test database.

## Requirements

- Docker Desktop is running.
- The SkillForge PostgreSQL service is running.
- `.env.database` is configured.

Run commands from `C:\Projects\skillforge` in the same PowerShell session.
Stop if a command reports an error.

## 1. Create a backup

Store backups outside the repository. They contain application data,
administrator accounts, and password hashes.

```powershell
New-Item -ItemType Directory -Force C:\Projects\skillforge-backups

$backupStamp = Get-Date -Format "yyyyMMdd_HHmmss"
$backupFile = "skillforge-$backupStamp.dump"

docker compose --env-file .env.database exec -T db pg_dump -U skillforge -d skillforge -Fc -f "/tmp/$backupFile"

docker compose --env-file .env.database cp "db:/tmp/$backupFile" "C:\Projects\skillforge-backups\$backupFile"
```

`pg_dump` exports the database schema and data.
`-Fc` selects the custom archive format used by `pg_restore`.

## 2. Restore into a test database

Copy the saved backup back into the container, then restore it into a
new database. The application continues using the original `skillforge`
database.

```powershell
docker compose --env-file .env.database cp "C:\Projects\skillforge-backups\$backupFile" "db:/tmp/restore-$backupFile"

$restoreDb = "skillforge_restore_$backupStamp"

docker compose --env-file .env.database exec -T db createdb -U skillforge -T template0 $restoreDb

docker compose --env-file .env.database exec -T db pg_restore -U skillforge -d $restoreDb --no-owner --single-transaction "/tmp/restore-$backupFile"
```

`--single-transaction` makes restoration succeed as a whole or roll back
its changes if an error occurs.

## 3. Verify restored data

```powershell
$sql = @'
SELECT 'topics' AS table_name, count(*) AS rows FROM topics
UNION ALL
SELECT 'lessons', count(*) FROM lessons
UNION ALL
SELECT 'resources', count(*) FROM resources;

SELECT "Id", "Title"
FROM lessons
WHERE "Id" = 'linux-files';
'@

$sql | docker compose --env-file .env.database exec -T db psql -U skillforge -d $restoreDb -v ON_ERROR_STOP=1
```

Compare the results with the data expected at the time of the backup.

### Recorded practice result

The practice backup was successfully restored and contained:

- 6 topics
- 18 lessons
- 12 resources
- The lesson title `Navigate Linux files and directories`

These counts describe this test backup, not the default seed dataset.

## 4. Remove the test database

After verification, remove only the temporary restore database:

```powershell
if ($restoreDb -match '^skillforge_restore_\d{8}_\d{6}$') {
    docker compose --env-file .env.database exec -T db dropdb -U skillforge $restoreDb
} else {
    Write-Error "Unexpected test database name. Nothing was deleted."
}
```

The original database and the backup file on the PC remain available.

## Backup scope

This backup includes PostgreSQL schema and data.

It does not include:

- Browser-local progress and notes
- Data Protection keys stored in the `api_keys` Docker volume
- Environment files and .NET User Secrets
- PostgreSQL server roles and other cluster-wide configuration

Do not commit database backup files to Git.
