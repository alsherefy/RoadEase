from PyQt6.QtWidgets import (
    QWidget, QVBoxLayout, QLabel, QPushButton, QColorDialog, QLineEdit,
    QFileDialog, QMessageBox, QComboBox
)
from PyQt6.QtGui import QPixmap
from database.settings import create_settings_table, get_settings, update_settings
import os

class SettingsWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("إعدادات الورشة")
        self.setGeometry(400, 200, 600, 450)
        create_settings_table()
        self.init_ui()
        self.load_settings()

    def init_ui(self):
        layout = QVBoxLayout()

        self.workshop_name_input = QLineEdit()
        self.workshop_name_input.setPlaceholderText("اسم الورشة")

        self.app_logo_label = QLabel("شعار التطبيق")
        self.app_logo_pixmap = QLabel()
        self.app_logo_pixmap.setFixedSize(200, 100)
        self.upload_app_logo_btn = QPushButton("رفع شعار التطبيق")
        self.upload_app_logo_btn.clicked.connect(lambda: self.upload_logo('app'))

        self.invoice_logo_label = QLabel("شعار الفاتورة")
        self.invoice_logo_pixmap = QLabel()
        self.invoice_logo_pixmap.setFixedSize(200, 100)
        self.upload_invoice_logo_btn = QPushButton("رفع شعار الفاتورة")
        self.upload_invoice_logo_btn.clicked.connect(lambda: self.upload_logo('invoice'))

        self.logo_position_combo = QComboBox()
        self.logo_position_combo.addItems(['top-left', 'top-center', 'top-right'])

        self.primary_color_btn = QPushButton("اختيار اللون الرئيسي")
        self.primary_color_btn.clicked.connect(self.choose_primary_color)

        self.secondary_color_btn = QPushButton("اختيار اللون الثانوي")
        self.secondary_color_btn.clicked.connect(self.choose_secondary_color)

        self.text_color_btn = QPushButton("اختيار لون النص")
        self.text_color_btn.clicked.connect(self.choose_text_color)

        self.save_btn = QPushButton("حفظ الإعدادات")
        self.save_btn.clicked.connect(self.save_settings)

        self.primary_color = '#F57C00'
        self.secondary_color = '#EF6C00'
        self.text_color = '#000000'
        self.app_logo_path = None
        self.invoice_logo_path = None

        layout.addWidget(self.workshop_name_input)
        layout.addWidget(self.app_logo_label)
        layout.addWidget(self.app_logo_pixmap)
        layout.addWidget(self.upload_app_logo_btn)
        layout.addWidget(self.invoice_logo_label)
        layout.addWidget(self.invoice_logo_pixmap)
        layout.addWidget(self.upload_invoice_logo_btn)
        layout.addWidget(QLabel("موضع شعار الفاتورة"))
        layout.addWidget(self.logo_position_combo)
        layout.addWidget(self.primary_color_btn)
        layout.addWidget(self.secondary_color_btn)
        layout.addWidget(self.text_color_btn)
        layout.addWidget(self.save_btn)

        self.setLayout(layout)

    def load_settings(self):
        settings = get_settings()
        if settings:
            self.primary_color = settings[0]
            self.secondary_color = settings[1]
            self.text_color = settings[2]
            self.workshop_name_input.setText(settings[3] or "")
            self.app_logo_path = settings[4]
            self.invoice_logo_path = settings[5]
            pos = settings[6] or 'top-left'
            index = self.logo_position_combo.findText(pos)
            if index >= 0:
                self.logo_position_combo.setCurrentIndex(index)
            if self.app_logo_path and os.path.exists(self.app_logo_path):
                pix = QPixmap(self.app_logo_path).scaled(200, 100)
                self.app_logo_pixmap.setPixmap(pix)
            if self.invoice_logo_path and os.path.exists(self.invoice_logo_path):
                pix = QPixmap(self.invoice_logo_path).scaled(200, 100)
                self.invoice_logo_pixmap.setPixmap(pix)

    def upload_logo(self, logo_type):
        file_dialog = QFileDialog()
        file_path, _ = file_dialog.getOpenFileName(self, "اختر صورة", "", "Images (*.png *.jpg *.bmp)")
        if file_path:
            pix = QPixmap(file_path).scaled(200, 100)
            if logo_type == 'app':
                self.app_logo_pixmap.setPixmap(pix)
                self.app_logo_path = file_path
            else:
                self.invoice_logo_pixmap.setPixmap(pix)
                self.invoice_logo_path = file_path

    def choose_primary_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            self.primary_color = color.name()

    def choose_secondary_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            self.secondary_color = color.name()

    def choose_text_color(self):
        color = QColorDialog.getColor()
        if color.isValid():
            self.text_color = color.name()

    def save_settings(self):
        update_settings(
            self.primary_color,
            self.secondary_color,
            self.text_color,
            self.workshop_name_input.text(),
            self.app_logo_path,
            self.invoice_logo_path,
            self.logo_position_combo.currentText()
        )
        QMessageBox.information(self, "تم", "تم حفظ الإعدادات بنجاح.")
