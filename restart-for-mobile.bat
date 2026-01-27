@echo off
echo ========================================
echo Restarting Servers for Mobile Access
echo ========================================
echo.
echo This will close any running servers and start fresh...
echo.
pause

:: Kill existing Node processes
echo Stopping existing servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2

echo.
echo Starting Backend Server...
start "Backend (Port 5000)" cmd /k "cd /d C:\Users\dean\soc-app\server && echo Backend starting on http://172.20.10.9:5000 && npm run dev"

timeout /t 5

echo.
echo Starting Frontend Server...
start "Frontend (Port 3000)" cmd /k "cd /d C:\Users\dean\soc-app\client && echo Frontend starting on http://172.20.10.9:3000 && npm start"

timeout /t 3

echo.
echo ========================================
echo Servers are starting!
echo ========================================
echo.
echo Wait 10-15 seconds for both to fully start, then:
echo.
echo On your iPhone (same WiFi):
echo   1. Open Safari
echo   2. Go to: http://172.20.10.9:3000
echo   3. Login with: deanreddy@hotmail.com
echo.
echo If login fails, check:
echo   - Both servers are running (check the windows that opened)
echo   - Your iPhone is on the same WiFi network
echo   - Windows Firewall allows Node.js
echo.
pause
