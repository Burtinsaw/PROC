@echo off
echo ========================================
echo   Satin Alma Takip Sistemi Kurulumu
echo ========================================
echo.

python --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Python kurulu degil!
    echo Lutfen Python 3.8+ yukleyip tekrar deneyin.
    pause
    exit /b 1
)

node --version >nul 2>&1
if errorlevel 1 (
    echo HATA: Node.js kurulu degil!
    echo Lutfen Node.js 18+ yukleyip tekrar deneyin.
    pause
    exit /b 1
)

echo Python ve Node.js kurulu
echo.

echo [1/4] Backend kurulumu baslatiyor...

if not exist "procurement_system" (
    echo procurement_system klasoru olusturuluyor...
    mkdir procurement_system
)

cd procurement_system

if not exist "venv" (
    echo Virtual environment olusturuluyor...
    python -m venv venv
)

echo Virtual environment aktiflestirilyor...
call venv\Scripts\activate.bat

if not exist "requirements.txt" (
    echo requirements.txt olusturuluyor...
    echo flask==3.0.3> requirements.txt
    echo flask-cors==4.0.0>> requirements.txt
)

echo Python paketleri yukleniyor...
pip install -r requirements.txt

if not exist "src" (
    mkdir src
)

if not exist "src\main.py" (
    echo main.py olusturuluyor...
    echo from flask import Flask, jsonify> src\main.py
    echo from flask_cors import CORS>> src\main.py
    echo.>> src\main.py
    echo app = Flask(__name__)>> src\main.py
    echo CORS(app)>> src\main.py
    echo.>> src\main.py
    echo @app.route('/api/health')>> src\main.py
    echo def health():>> src\main.py
    echo     return jsonify({'status': 'OK', 'message': 'Sistem calisiyor'})>> src\main.py
    echo.>> src\main.py
    echo if __name__ == '__main__':>> src\main.py
    echo     print('Backend baslatiyor...')>> src\main.py
    echo     app.run(host='0.0.0.0', port=5001)>> src\main.py
)

cd ..

echo.
echo [2/4] Frontend kurulumu baslatiyor...

if not exist "procurement_frontend" (
    mkdir procurement_frontend
)

cd procurement_frontend

if not exist "index.html" (
    echo index.html olusturuluyor...
    echo ^<!DOCTYPE html^>> index.html
    echo ^<html^>> index.html
    echo ^<head^>> index.html
    echo ^<title^>Satin Alma Sistemi^</title^>> index.html
    echo ^<style^>> index.html
    echo body { font-family: Arial; margin: 40px; background: #f5f5f5; }>> index.html
    echo .container { max-width: 800px; margin: 0 auto; background: white; padding: 30px; }>> index.html
    echo h1 { color: #1976d2; text-align: center; }>> index.html
    echo ^</style^>> index.html
    echo ^</head^>> index.html
    echo ^<body^>> index.html
    echo ^<div class="container"^>> index.html
    echo ^<h1^>Satin Alma Takip Sistemi^</h1^>> index.html
    echo ^<p^>Sistem calisiyor!^</p^>> index.html
    echo ^<p^>Backend: http://localhost:5001/api/health^</p^>> index.html
    echo ^<p^>Giris: admin / admin123^</p^>> index.html
    echo ^</div^>> index.html
    echo ^</body^>> index.html
    echo ^</html^>> index.html
 )

cd ..

echo.
echo [3/4] Baslatma scripti olusturuluyor...

echo @echo off> start_system.bat
echo echo Backend baslatiyor...>> start_system.bat
echo start "Backend" cmd /k "cd procurement_system && venv\Scripts\activate && python src\main.py">> start_system.bat
echo timeout /t 3 /nobreak>> start_system.bat
echo echo Frontend baslatiyor...>> start_system.bat
echo start "Frontend" cmd /k "cd procurement_frontend && python -m http.server 5173">> start_system.bat
echo echo Sistem baslatildi!>> start_system.bat
echo echo Frontend: http://localhost:5173>> start_system.bat
echo echo Backend: http://localhost:5001/api/health>> start_system.bat

echo.
echo ========================================
echo           KURULUM TAMAMLANDI!
echo ========================================
echo.
echo Sistemi baslatmak icin: start_system.bat
echo.
echo Giris bilgileri:
echo   Kullanici: admin
echo   Sifre: admin123
echo.
echo Adresler:
echo   Frontend: http://localhost:5173
echo   Backend: http://localhost:5001/api/health
echo.
pause
