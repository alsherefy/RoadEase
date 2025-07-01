from database.settings import get_connection

def create_requests_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS requests (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_id INTEGER NOT NULL,
            car_id INTEGER NOT NULL,
            service_details TEXT,
            parts_needed TEXT,
            status TEXT DEFAULT 'قيد الانتظار',
            request_date TEXT,
            completion_date TEXT,
            FOREIGN KEY(customer_id) REFERENCES customers(id),
            FOREIGN KEY(car_id) REFERENCES cars(id)
        )
    ''')
    conn.commit()
    conn.close()

def add_request(customer_id, car_id, service_details, parts_needed, request_date):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO requests (customer_id, car_id, service_details, parts_needed, request_date)
        VALUES (?, ?, ?, ?, ?)
    ''', (customer_id, car_id, service_details, parts_needed, request_date))
    conn.commit()
    conn.close()

def update_request_status(request_id, status, completion_date=None):
    conn = get_connection()
    cursor = conn.cursor()
    if completion_date:
        cursor.execute('''
            UPDATE requests SET status = ?, completion_date = ? WHERE id = ?
        ''', (status, completion_date, request_id))
    else:
        cursor.execute('''
            UPDATE requests SET status = ? WHERE id = ?
        ''', (status, request_id))
    conn.commit()
    conn.close()

def get_requests_by_status(status):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM requests WHERE status = ?', (status,))
    requests = cursor.fetchall()
    conn.close()
    return requests
