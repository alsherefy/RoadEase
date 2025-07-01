from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QListWidget, QPushButton, QFileDialog, QMessageBox
from database import get_connection
import pandas as pd

class LoyaltyReportWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("تقرير نقاط الولاء")
        self.setGeometry(450, 200, 500, 400)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        self.list_widget = QListWidget()

        self.export_button = QPushButton("تصدير إلى Excel")
        self.export_button.clicked.connect(self.export_to_excel)
        self.export_button.setStyleSheet("""
            QPushButton {
                background-color: #F57C00;
                color: white;
                padding: 10px;
                font-weight: bold;
                border-radius: 6px;
            }
            QPushButton:hover {
                background-color: #EF6C00;
            }
        """)

        layout.addWidget(QLabel("قائمة العملاء ونقاطهم"))
        layout.addWidget(self.list_widget)
        layout.addWidget(self.export_button)

        self.setLayout(layout)
        self.load_loyalty()

    def load_loyalty(self):
        self.list_widget.clear()
        conn = get_connection()
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS loyalty (
                customer TEXT PRIMARY KEY,
                points INTEGER
            )""")
        cursor.execute("SELECT customer, points FROM loyalty ORDER BY points DESC")
        for customer, points in cursor.fetchall():
            self.list_widget.addItem(f"{customer} - {points} نقطة")
        conn.close()

    def export_to_excel(self):
        conn = get_connection()
        df = pd.read_sql_query("SELECT customer, points FROM loyalty", conn)
        conn.close()

        file_path, _ = QFileDialog.getSaveFileName(self, "حفظ التقرير", "loyalty.xlsx", "Excel Files (*.xlsx)")
        if file_path:
            df.to_excel(file_path, index=False)
            QMessageBox.information(self, "تم", "تم حفظ تقرير الولاء بنجاح")
