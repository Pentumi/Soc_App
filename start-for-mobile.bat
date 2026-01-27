@echo off
echo ========================================
echo Golf Society App - Mobile Testing Mode
echo ========================================
echo.
echo Your local IP: 172.20.10.9
echo.
echo Starting servers for iPhone testing...
echo.
echo Backend will be available at: http://172.20.10.9:5000
echo Frontend will be available at: http://172.20.10.9:3000
echo.
echo Make sure your iPhone is connected to the SAME WiFi network!
echo.
pause

start "Backend Server" cmd /k "cd server && npm run dev"
timeout /t 3
start "Frontend Server" cmd /k "cd client && npm start"

echo.
echo Both servers are starting in separate windows...
echo.
echo On your iPhone, open Safari and go to:
echo http://172.20.10.9:3000
echo.
pause
