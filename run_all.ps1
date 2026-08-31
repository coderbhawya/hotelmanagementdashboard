# Taco Bell Gourmet - All-in-One PowerShell Launcher
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host "         TACO BELL GOURMET HOTEL FOOD SUITE & KDS SYSTEM" -ForegroundColor Yellow
Write-Host "======================================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[1/3] Compiling C++ Backend (food_menu.cpp)..." -ForegroundColor Cyan
Stop-Process -Name food_menu -Force -ErrorAction SilentlyContinue
g++ -std=c++17 -O2 food_menu.cpp -o food_menu.exe
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] C++ compilation failed!" -ForegroundColor Red
    exit 1
}
Write-Host "[OK] C++ backend compiled successfully (food_menu.exe)" -ForegroundColor Green

Write-Host "`n[2/3] Starting Node.js Real-Time Synchronization Server..." -ForegroundColor Cyan
Start-Process -FilePath "node" -ArgumentList "server.js" -WindowStyle Hidden
Start-Sleep -Seconds 2

Write-Host "`n[3/3] Opening Web Dashboard at http://localhost:3000..." -ForegroundColor Cyan
Start-Process "http://localhost:3000"

Write-Host "`n======================================================================" -ForegroundColor Green
Write-Host " INTERACTIVE C++ ORDERING TERMINAL ACTIVE" -ForegroundColor Yellow
Write-Host " Orders typed here instantly appear on the Web Dashboard in <50ms!" -ForegroundColor White
Write-Host "======================================================================`n" -ForegroundColor Green

.\food_menu.exe
