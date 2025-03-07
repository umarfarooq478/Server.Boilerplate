#!/bin/bash

# Define source and target database connection details
SOURCE_HOST="$1"
SOURCE_USER="$4"
SOURCE_PASS="$2"
SOURCE_DB="$3"
BACKUP_DIR="$5"
SOURCE_PORT="${6:=3306}"

# Create timestamp for backup filename
TIMESTAMP=$(date +"%Y%m%d%H%M%S")

# Create backup filename
BACKUP_FILENAME="$SOURCE_DB-$TIMESTAMP.sql"
echo "$SOURCE_HOST \n $SOURCE_PASS \n $SOURCE_DB:"
# Function to check if a database exists
check_database_exists() {
    local db_name="$1"
    echo "Local db: $db_name"
    local result=$(mysql -h "$2" -P "$3" -u "$4" -p"$5" -e "SELECT SCHEMA_NAME FROM INFORMATION_SCHEMA.SCHEMATA WHERE SCHEMA_NAME = '$db_name'")
    
    if [[ -n "$result" ]]; then
        return 0 # Database exists
    else
        return 1 # Database does not exist
    fi
}

# Check if source database exists
if check_database_exists "$SOURCE_DB" "$SOURCE_HOST" "$SOURCE_PORT" "$SOURCE_USER" "$SOURCE_PASS"; then
    echo "Source database '$SOURCE_DB' exists. Proceeding with backup..."
        
        # Create backup
	echo "Creating backup..."
	mysqldump -h "$SOURCE_HOST" -P "$SOURCE_PORT" -u "$SOURCE_USER" -p"$SOURCE_PASS" "$SOURCE_DB" --set-gtid-purged=OFF > "$BACKUP_DIR/$BACKUP_FILENAME"

	# Verify backup creation
	if [ $? -eq 0 ]; then
	    echo "Backup created successfully: $BACKUP_FILENAME"
	else
	    echo "Backup creation failed."
	    exit 1
	fi
        
else
    echo "Source database '$SOURCE_DB' does not exist. Backup aborted."
fi


