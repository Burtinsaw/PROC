@echo off
echo Backend baslatiyor...
start "Backend" cmd /k "cd procurement_system && venv\Scripts\activate && python src\main.py"
timeout /t 3 /nobreak
echo Frontend baslatiyor...
start "Frontend" cmd /k "cd procurement_frontend && python -m http.server 5173"
echo Sistem baslatildi!
echo Frontend: http://localhost:5173
echo Backend: http://localhost:5001/api/health
