import sys
from PyQt6.QtWidgets import QApplication
from ui.login import LoginWindow
from database import initialize_database

def main():
    initialize_database()
    app = QApplication(sys.argv)
    login_window = LoginWindow()
    login_window.show()
    sys.exit(app.exec())

if __name__ == "__main__":
    main()
