@echo off
rd /s /q build
rd /s /q dist
if exist RoadEase.spec del RoadEase.spec
pyinstaller main.py --noconfirm --onedir --add-data "ui;ui" --add-data "database;database" --add-data "assets;assets" --name RoadEase
pause
