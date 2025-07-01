from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QFileDialog, QMessageBox
from database.invoices import get_invoices_by_period
from database.expenses import get_expenses_by_period
import pandas as pd
import datetime

class ReportsWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("التقارير المالية")
        self.setGeometry(450, 200, 400, 300)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        self.export_btn = QPushButton("تصدير تقرير المبيعات والمصاريف")
        self.export_btn.clicked.connect(self.export_report)

        layout.addWidget(self.export_btn)
        self.setLayout(layout)

    def export_report(self):
        start_date = (datetime.date.today() - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        end_date = datetime.date.today().strftime("%Y-%m-%d")

        invoices = get_invoices_by_period(start_date, end_date)
        expenses = get_expenses_by_period(start_date, end_date)

        df_invoices = pd.DataFrame(invoices, columns=['ID', 'CustomerID', 'CarID', 'Services', 'Parts', 'Total', 'Date'])
        df_expenses = pd.DataFrame(expenses, columns=['ID', 'Type', 'Amount', 'Date'])

        file_path, _ = QFileDialog.getSaveFileName(self, "حفظ التقرير", "financial_report.xlsx", "Excel Files (*.xlsx)")
        if file_path:
            with pd.ExcelWriter(file_path) as writer:
                df_invoices.to_excel(writer, sheet_name='Invoices', index=False)
                df_expenses.to_excel(writer, sheet_name='Expenses', index=False)
            QMessageBox.information(self, "تم", "تم حفظ التقرير بنجاح.")
