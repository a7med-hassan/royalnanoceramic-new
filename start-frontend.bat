@echo off
echo ========================================
echo Starting Royal Nano Ceramic Frontend
echo ========================================

echo.
echo 1. Checking if node_modules exists...
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
) else (
    echo Dependencies already installed.
)

echo.
echo 2. Starting development server...
echo Server will be available at: http://localhost:4200
echo.
echo Press Ctrl+C to stop the server
echo.

call ng serve --port 4200

pause
