from database.settings import get_connection

def create_customers_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            phone TEXT UNIQUE NOT NULL,
            address TEXT,
            email TEXT
        )
    ''')
    conn.commit()
    conn.close()

def add_customer(name, phone, address='', email=''):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO customers (name, phone, address, email)
        VALUES (?, ?, ?, ?)
    ''', (name, phone, address, email))
    conn.commit()
    conn.close()

def get_customer_by_phone(phone):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers WHERE phone = ?', (phone,))
    customer = cursor.fetchone()
    conn.close()
    return customer

def get_all_customers():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM customers')
    customers = cursor.fetchall()
    conn.close()
    return customers
