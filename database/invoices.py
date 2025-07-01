from database.settings import get_connection

def create_invoices_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS invoices (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            car_id INTEGER NOT NULL,
            services TEXT,
            parts TEXT,
            total REAL,
            tax REAL,
            date TEXT,
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            FOREIGN KEY(car_id) REFERENCES cars(id)
        )
    ''')
    conn.commit()
    conn.close()

def add_invoice(customer_id, car_id, services, parts, total, tax, date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO invoices (customer_id, car_id, services, parts, total, tax, date)
        VALUES (?, ?, ?, ?, ?, ?, ?)
    ''', (customer_id, car_id, services, parts, total, tax, date))
    conn.commit()
    conn.close()

def get_invoices_by_period(start_date, end_date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        SELECT id, customer_id, car_id, services, parts, total, date
        FROM invoices
        WHERE date BETWEEN ? AND ?
    ''', (start_date, end_date))
    invoices = cursor.fetchall()
    conn.close()
    return invoices
