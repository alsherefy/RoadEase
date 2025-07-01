from database.settings import get_connection

def create_notifications_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS notifications (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            message TEXT NOT NULL,
            date TEXT NOT NULL,
            is_read INTEGER DEFAULT 0
        )
    ''')
    conn.commit()
    conn.close()

def add_notification(message, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('INSERT INTO notifications (message, date) VALUES (?, ?)', (message, date))
    conn.commit()
    conn.close()

def get_unread_notifications():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT id, message, date FROM notifications WHERE is_read=0 ORDER BY date DESC')
    notifications = cursor.fetchall()
    conn.close()
    return notifications

def mark_as_read(notification_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('UPDATE notifications SET is_read=1 WHERE id=?', (notification_id,))
    conn.commit()
    conn.close()
