@echo off
title Taco Bell Gourmet - Real-Time Dashboard & Terminal
cls
echo ======================================================================
echo           TACO BELL GOURMET HOTEL FOOD SUITE ^& KDS SYSTEM
echo ======================================================================
echo.
echo  [1/3] Compiling C++ Backend (food_menu.cpp)...
taskkill /F /IM food_menu.exe >nul 2>&1
g++ -std=c++17 -O2 food_menu.cpp -o food_menu.exe
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Compilation failed!
    pause
    exit /b %ERRORLEVEL%
)
echo  [OK] C++ backend ready (food_menu.exe)
echo.
echo  [2/3] Launching Node.js Real-Time Synchronization Server...
start "Taco Bell Real-Time Server" /min cmd /c "node server.js"
timeout /t 2 /nobreak >nul
echo.
echo  [3/3] Launching Ultra-Modern White KDS Dashboard in Browser...
start http://localhost:3000
echo.
echo ======================================================================
echo  INTERACTIVE C++ ORDERING TERMINAL ACTIVE
echo  Orders typed here instantly sync to the Web KDS in ^<50ms!
echo ======================================================================
echo.
food_menu.exe
