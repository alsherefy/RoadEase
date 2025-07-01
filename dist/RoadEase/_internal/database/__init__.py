from .settings import create_settings_table
from .customers import create_customers_table
from .cars import create_cars_table
from .requests import create_requests_table
from .inventory import create_inventory_table
from .invoices import create_invoices_table
from .expenses import create_expenses_table
from .notifications import create_notifications_table
from .users import create_users_table

def initialize_database():
    create_settings_table()
    create_customers_table()
    create_cars_table()
    create_requests_table()
    create_inventory_table()
    create_invoices_table()
    create_expenses_table()
    create_notifications_table()
    create_users_table()
