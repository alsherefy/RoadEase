from database.settings import get_connection

def create_expenses_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS expenses (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            type TEXT NOT NULL,
            amount REAL NOT NULL,
            date TEXT NOT NULL
        )
    ''')
    conn.commit()
    conn.close()

def add_expense(type_, amount, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO expenses (type, amount, date)
        VALUES (?, ?, ?)
    ''', (type_, amount, date))
    conn.commit()
    conn.close()

def get_expenses_by_period(start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, type, amount, date FROM expenses WHERE date BETWEEN ? AND ?
    ''', (start_date, end_date))
    expenses = cursor.fetchall()
    conn.close()
    return expenses
