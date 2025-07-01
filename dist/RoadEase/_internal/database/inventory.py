from database.settings import get_connection

def create_inventory_table():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS inventory (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            code TEXT UNIQUE,
            current_stock INTEGER DEFAULT 0,
            purchase_price REAL,
            sale_price REAL,
            min_stock INTEGER DEFAULT 5
        )
    ''')
    conn.commit()
    conn.close()

def add_part(name, code, current_stock, purchase_price, sale_price, min_stock=5):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        INSERT INTO inventory (name, code, current_stock, purchase_price, sale_price, min_stock)
        VALUES (?, ?, ?, ?, ?, ?)
    ''', (name, code, current_stock, purchase_price, sale_price, min_stock))
    conn.commit()
    conn.close()

def update_stock(part_id, quantity_change):
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('''
        UPDATE inventory SET current_stock = current_stock + ? WHERE id = ?
    ''', (quantity_change, part_id))
    conn.commit()
    conn.close()

def get_low_stock_parts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM inventory WHERE current_stock <= min_stock')
    parts = cursor.fetchall()
    conn.close()
    return parts

def get_all_parts():
    conn = get_connection()
    cursor = conn.cursor()
    cursor.execute('SELECT * FROM inventory')
    parts = cursor.fetchall()
    conn.close()
    return parts
