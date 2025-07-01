import shutil
import datetime
import os

DB_PATH = "database/roadease.db"
BACKUP_DIR = "database/backups"

def backup_database():
    if not os.path.exists(BACKUP_DIR):
        os.makedirs(BACKUP_DIR)
    timestamp = datetime.datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_path = os.path.join(BACKUP_DIR, f"roadease_backup_{timestamp}.db")
    try:
        shutil.copy2(DB_PATH, backup_path)
        print(f"Backup successful: {backup_path}")
        return True
    except Exception as e:
        print(f"Backup failed: {e}")
        return False

if __name__ == "__main__":
    backup_database()
