from PyQt6.QtWidgets import QWidget, QVBoxLayout, QPushButton, QLabel
from PyQt6.QtGui import QPixmap
from database.settings import get_settings
from ui.reports import ReportsWindow
from ui.settings import SettingsWindow
import os

class DashboardWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("لوحة القيادة - RoadEase")
        self.setGeometry(400, 200, 700, 500)
        self.settings = None
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        self.settings = get_settings()
        primary_color = self.settings[0] if self.settings else '#F57C00'
        secondary_color = self.settings[1] if self.settings else '#EF6C00'
        app_logo_path = self.settings[4] if self.settings else None

        if app_logo_path and os.path.exists(app_logo_path):
            logo_label = QLabel()
            pixmap = QPixmap(app_logo_path)
            logo_label.setPixmap(pixmap.scaled(200, 100))
            layout.addWidget(logo_label)

        self.reports_btn = QPushButton("التقارير المالية")
        self.reports_btn.clicked.connect(self.open_reports_window)
        self.reports_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {primary_color};
                color: white;
                padding: 12px;
                font-weight: bold;
                border-radius: 6px;
            }}
            QPushButton:hover {{
                background-color: {secondary_color};
            }}
        """)

        self.settings_btn = QPushButton("إعدادات الورشة")
        self.settings_btn.clicked.connect(self.open_settings_window)
        self.settings_btn.setStyleSheet(f"""
            QPushButton {{
                background-color: {primary_color};
                color: white;
                padding: 12px;
                font-weight: bold;
                border-radius: 6px;
            }}
            QPushButton:hover {{
                background-color: {secondary_color};
            }}
        """)

        layout.addWidget(self.reports_btn)
        layout.addWidget(self.settings_btn)

        self.setLayout(layout)

    def open_reports_window(self):
        self.reports_window = ReportsWindow()
        self.reports_window.show()

    def open_settings_window(self):
        self.settings_window = SettingsWindow()
        self.settings_window.show()
