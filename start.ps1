# Smart City Site Planner — Execution Launcher (SIH 26114)

Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host "  SMART CITY SITE PLANNER - STARTUP LAUNCHER (SIH 26114)  " -ForegroundColor Cyan
Write-Host "==========================================================" -ForegroundColor Cyan

$ROOT = $PSScriptRoot

# 1. Setup Backend
Write-Host "`n[1/2] Starting Flask Backend (Port 5000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\backend'; python -m venv venv; .\venv\Scripts\activate; pip install -r requirements.txt; python app.py"

# 2. Setup Frontend
Write-Host "`n[2/2] Starting Vite Frontend Dev Server (Port 5173)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd '$ROOT\frontend'; npm install; npm run dev"

Write-Host "`n==========================================================" -ForegroundColor Green
Write-Host "  Both Backend and Frontend servers are launching!        " -ForegroundColor Green
Write-Host "  Frontend: http://localhost:5173                          " -ForegroundColor Green
Write-Host "  Backend:  http://localhost:5000                          " -ForegroundColor Green
Write-Host "==========================================================" -ForegroundColor Green
