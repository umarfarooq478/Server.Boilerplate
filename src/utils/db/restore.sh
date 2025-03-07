#!/bin/bash

# Define source and target environment configurations
SOURCE_ENV="production"
TARGET_ENV="testing"
DB_NAME="$3"
# Define target database connection details
TARGET_HOST="$1"
TARGET_USER="$4"
TARGET_PASS="$2"
TARGET_DB="$3"

BACKUP_DIR="$5"

TARGET_PORT="${6:=3306}"


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
if check_database_exists "$TARGET_DB" "$TARGET_HOST" "$TARGET_PORT" "$TARGET_USER" "$TARGET_PASS"; then
    read -p "The database '$TARGET_DB' already exists. Do you want to overwrite it? (yes/no): " overwrite_input
    if [ "$overwrite_input" = "yes" ]; then
        latest_backup_file=$(ls -t "$BACKUP_DIR"/"$TARGET_DB"-*.sql | head -n 1)
        if [ -n "$latest_backup_file" ]; then
            echo "Restoring database '$TARGET_DB' from backup file '$latest_backup_file'..."
            mysql -h "$TARGET_HOST" -P "$TARGET_PORT" -u "$TARGET_USER" -p"$TARGET_PASS" "$TARGET_DB" < "$latest_backup_file"
            echo "Database '$TARGET_DB' has been restored."
        else
            echo "No backup files found for database '$TARGET_DB'."
        fi
    else
        echo "Restoration process cancelled."
    fi
else
    echo "Database '$TARGET_DB' does not exist. Creating and restoring..."
  
    # Create the database
    mysql -h "$TARGET_HOST" -P "$TARGET_PORT" -u "$TARGET_USER" -p"$TARGET_PASS" -e "CREATE DATABASE $TARGET_DB;"
  
    # Find the latest backup file
    latest_backup_file=$(ls -t "$BACKUP_DIR"/*.sql | head -n 1)
  
    if [ -n "$latest_backup_file" ]; then
        # Restore the database
        mysql -h "$TARGET_HOST" -P "$TARGET_PORT" -u "$TARGET_USER" -p"$TARGET_PASS" "$TARGET_DB" < "$latest_backup_file"
        echo "Database '$TARGET_DB' has been created and restored."
    else
        echo "No backup files found."
    fi
fi

