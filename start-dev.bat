@echo off
echo.
echo ========================================
echo   Voice POS Development Environment
echo ========================================
echo.

echo Starting Backend Server...
start "Voice POS Backend" cmd /k "cd backend && npm run dev"

timeout /t 2 /nobreak >nul

echo Starting Frontend Server...
start "Voice POS Frontend" cmd /k "cd frontend && npm run dev"

echo.
echo ========================================
echo   Both servers are starting!
echo ========================================
echo   Backend:  http://localhost:3000
echo   Frontend: http://localhost:5173
echo ========================================
echo.
echo Close the CMD windows to stop servers
echo.
pause
