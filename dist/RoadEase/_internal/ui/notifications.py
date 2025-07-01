from PyQt6.QtWidgets import QWidget, QVBoxLayout, QListWidget, QPushButton
from database.notifications import get_unread_notifications, mark_as_read
from PyQt6.QtWidgets import QMessageBox
import datetime

class NotificationsWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("التنبيهات")
        self.setGeometry(500, 250, 400, 300)
        self.init_ui()
        self.load_notifications()

    def init_ui(self):
        layout = QVBoxLayout()

        self.list_widget = QListWidget()
        self.mark_read_btn = QPushButton("وضع الكل كمقروء")
        self.mark_read_btn.clicked.connect(self.mark_all_read)

        layout.addWidget(self.list_widget)
        layout.addWidget(self.mark_read_btn)
        self.setLayout(layout)

    def load_notifications(self):
        self.list_widget.clear()
        notifications = get_unread_notifications()
        for n in notifications:
            self.list_widget.addItem(f"{n[2]} - {n[1]}")

    def mark_all_read(self):
        notifications = get_unread_notifications()
        for n in notifications:
            mark_as_read(n[0])
        QMessageBox.information(self, "تم", "تم وضع جميع التنبيهات كمقروءة.")
        self.load_notifications()

