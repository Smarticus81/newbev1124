# Voice POS Development Startup Script
# This script starts both frontend and backend concurrently

Write-Host "🚀 Starting Voice POS Development Environment..." -ForegroundColor Cyan
Write-Host ""

# Start backend in a new PowerShell window
Write-Host "📦 Starting Backend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\backend'; Write-Host '🔧 Backend Server' -ForegroundColor Yellow; npm run dev"

# Wait a moment for backend to initialize
Start-Sleep -Seconds 2

# Start frontend in a new PowerShell window
Write-Host "🎨 Starting Frontend Server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$PSScriptRoot\frontend'; Write-Host '🎨 Frontend Server' -ForegroundColor Cyan; npm run dev"

Write-Host ""
Write-Host "✅ Both servers are starting in separate windows!" -ForegroundColor Green
Write-Host "   - Backend: http://localhost:3000" -ForegroundColor Gray
Write-Host "   - Frontend: http://localhost:5173" -ForegroundColor Gray
Write-Host ""
Write-Host "💡 Tip: Close the individual PowerShell windows to stop the servers" -ForegroundColor Yellow
