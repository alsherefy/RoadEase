from PyQt6.QtWidgets import QWidget, QVBoxLayout, QLabel, QLineEdit, QPushButton, QMessageBox
from database.users import verify_user
from ui.dashboard import DashboardWindow

class LoginWindow(QWidget):
    def __init__(self):
        super().__init__()
        self.setWindowTitle("تسجيل الدخول - RoadEase")
        self.setGeometry(500, 300, 300, 200)
        self.init_ui()

    def init_ui(self):
        layout = QVBoxLayout()

        self.email_input = QLineEdit()
        self.email_input.setPlaceholderText("البريد الإلكتروني")

        self.password_input = QLineEdit()
        self.password_input.setPlaceholderText("كلمة المرور")
        self.password_input.setEchoMode(QLineEdit.EchoMode.Password)

        self.login_btn = QPushButton("تسجيل الدخول")
        self.login_btn.clicked.connect(self.login)

        layout.addWidget(QLabel("مرحباً بك في RoadEase"))
        layout.addWidget(self.email_input)
        layout.addWidget(self.password_input)
        layout.addWidget(self.login_btn)

        self.setLayout(layout)

    def login(self):
        email = self.email_input.text().strip()
        password = self.password_input.text().strip()
        user = verify_user(email, password)
        if user:
            self.dashboard = DashboardWindow()
            self.dashboard.show()
            self.close()
        else:
            QMessageBox.warning(self, "خطأ", "البريد الإلكتروني أو كلمة المرور غير صحيحة.")
