@echo off
echo Gelismis Satin Alma Sistemi Baslatiliyor...
echo.

echo Backend baslatiyor...
start "Backend Server" cmd /k "cd procurement_system_nodejs
node server.js"

timeout /t 3 /nobreak >nul

echo Frontend baslatiyor...
start "Frontend Server" cmd /k "cd procurement_mantis_original
npx vite"

echo.
echo Sistem baslatildi!
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
pause
