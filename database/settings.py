import sqlite3

DB_PATH = "database/roadease.db"

def get_connection():
    return sqlite3.connect(DB_PATH)

def create_settings_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS settings (
            id INTEGER PRIMARY KEY,
            primary_color TEXT DEFAULT '#F57C00',
            secondary_color TEXT DEFAULT '#EF6C00',
            text_color TEXT DEFAULT '#000000',
            workshop_name TEXT,
            app_logo_path TEXT,
            invoice_logo_path TEXT,
            logo_position TEXT DEFAULT 'top-left'
        )
    ''')
    conn.commit()
    cursor.execute('SELECT COUNT(*) FROM settings')
    if cursor.fetchone()[0] == 0:
        cursor.execute('INSERT INTO settings (id) VALUES (1)')
        conn.commit()
    conn.close()

def get_settings():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT primary_color, secondary_color, text_color,
               workshop_name, app_logo_path, invoice_logo_path, logo_position
        FROM settings WHERE id = 1
    ''')
    settings = cursor.fetchone()
    conn.close()
    return settings

def update_settings(primary_color, secondary_color, text_color, workshop_name,
                    app_logo_path, invoice_logo_path, logo_position):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE settings
        SET primary_color = ?, secondary_color = ?, text_color = ?, workshop_name = ?,
            app_logo_path = ?, invoice_logo_path = ?, logo_position = ?
        WHERE id = 1
    ''', (primary_color, secondary_color, text_color, workshop_name,
          app_logo_path, invoice_logo_path, logo_position))
    conn.commit()
    conn.close()
