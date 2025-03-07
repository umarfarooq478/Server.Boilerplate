# Database Utilities

This folder contains some scripts to aid in common database operations

## Prerequisites

The scripts use mysql cli to issue commands. So you need to have mysql server in your system

Click the link below to download and install mysql server.

1.  Select operating system
2.  click download button

https://dev.mysql.com/downloads/mysql/

## Scripts

Generate backup. (The backup file is automatically named according to the time of backup)

```
bash backup.sh hostname password dbName username backupDirectory
```

Restore a database snapshot. (Erases existing data in the target database).<br>
The script uses the latest backup file found in the backupDirectory

```
bash restore.sh hostname password dbName username backupDirectory
```

Copy source Database to target Database

```
bash migration.sh hostname password sourceDB targetDB
```
