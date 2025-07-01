from database.settings import get_connection

def create_cars_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            brand TEXT NOT NULL,
            model TEXT NOT NULL,
            year INTEGER,
            chassis_number TEXT,
            license_plate TEXT,
            FOREIGN KEY(customer_id) REFERENCES customers(id)
        )
    ''')
    conn.commit()
    conn.close()

def add_car(customer_id, brand, model, year, chassis_number, license_plate):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO cars (customer_id, brand, model, year, chassis_number, license_plate)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (customer_id, brand, model, year, chassis_number, license_plate))
    conn.commit()
    conn.close()

def get_cars_by_customer(customer_id):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM cars WHERE customer_id = ?', (customer_id,))
    cars = cursor.fetchall()
    conn.close()
    return cars
