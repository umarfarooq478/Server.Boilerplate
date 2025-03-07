#!/bin/bash

# Define source and target environment configurations
SOURCE_ENV="production"
TARGET_ENV="testing"
DB_NAME="$4"
# Define source and target database connection details
SOURCE_HOST="$1"
SOURCE_USER="admin"
SOURCE_PASS="$2"
SOURCE_DB="$3"

TARGET_HOST="$1"
TARGET_USER="admin"
TARGET_PASS="$2"
TARGET_DB="$4"
BACKUP_DIR="/home/adil/backup"
# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create backup filename
BACKUP_FILENAME="$DB_NAME-$TIMESTAMP.sql"
echo "$SOURCE_HOST \n $SOURCE_PASS \n $TARGET_PASS \n $SOURCE_DB \n $TARGET_DB:"
# Function to check if a database exists
check_database_exists() {
    local db_name="$1"
    echo "Local db: $db_name"
    local result=$(mysql -h "$2" -u "$3" -p"$4" -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$db_name'")
    
    if [[ -n "$result" ]]; then
        return 0 # Database exists
    else
        return 1 # Database does not exist
    fi
}

# Check if source database exists
if check_database_exists "$SOURCE_DB" "$SOURCE_HOST" "$SOURCE_USER" "$SOURCE_PASS"; then
    echo "Source database '$SOURCE_DB' exists. Proceeding with migration..."

    # Check if target database exists
    if check_database_exists "$TARGET_DB" "$TARGET_HOST" "$TARGET_USER" "$TARGET_PASS"; then
        echo "Target database '$TARGET_DB' exists. Proceeding with migration..."
        
        # Create backup
	echo "Creating backup..."
	mysqldump -h "$TARGET_HOST" -u "$TARGET_USER" -p"$TARGET_PASS" "$DB_NAME" --set-gtid-purged=OFF > "$BACKUP_DIR/$BACKUP_FILENAME"

	# Verify backup creation
	if [ $? -eq 0 ]; then
	    echo "Backup created successfully: $BACKUP_FILENAME"
	else
	    echo "Backup creation failed."
	    exit 1
	fi
	
	#Deleting testing database
        echo "Deleting database $DB_NAME..."
        mysql -h "$TARGET_HOST" -u "$TARGET_USER" -p"$TARGET_PASS" -e "DROP DATABASE $DB_NAME"
        echo "Database $DB_NAME deleted."
        
        
	echo "Restoring database $DB_NAME..."
	mysql -h "$TARGET_HOST" -u "$TARGET_USER" -p"$TARGET_PASS" -e "CREATE DATABASE $DB_NAME"
	
        # Export data from source database
        echo "Exporting data from $SOURCE_ENV..."
        mysqldump -h "$SOURCE_HOST" -u "$SOURCE_USER" -p"$SOURCE_PASS" "$SOURCE_DB" --set-gtid-purged=OFF > dump.sql

        # Import data into target database
        echo "Importing data into $TARGET_ENV..."
        mysql -h "$TARGET_HOST" -u "$TARGET_USER" -p"$TARGET_PASS" "$TARGET_DB" < dump.sql

        # Clean up exported SQL file
        rm dump.sql

        echo "Data migration from $SOURCE_ENV to $TARGET_ENV completed."
        
        
        
        #echo "Restoring database $DB_NAME..."
	#mysql -h "$SOURCE_HOST" -u "$SOURCE_USER" -p"$SOURCE_PASS" -e "CREATE DATABASE $DB_NAME"
	#mysql -h "$SOURCE_HOST" -u "$SOURCE_USER" -p"$SOURCE_PASS" "$DB_NAME" < "$BACKUP_DIR/$BACKUP_FILENAME"
	#echo "Database $DB_NAME restored."
        
	#checking the exit status of the most recently executed command
	if [ $? -eq 0 ]; then
	    echo "Backup restored successfully."
	else
	    echo "Backup restore failed."
	fi
	
    else
        echo "Target database '$TARGET_DB' does not exist. Migration aborted."
    fi
else
    echo "Source database '$SOURCE_DB' does not exist. Migration aborted."
fi


