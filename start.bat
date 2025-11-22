@echo off
echo Starting Voice POS System...
echo.

REM Start backend in a new window
start "Voice POS Backend" cmd /k "cd backend && npm run dev"

REM Wait a moment for backend to initialize
timeout /t 3 /nobreak > nul

REM Start frontend in a new window
start "Voice POS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo Both servers are starting in separate windows...
echo Backend: http://localhost:3000
echo Frontend: http://localhost:5173
echo.
echo Press any key to exit this window (servers will keep running)...
pause > nul
