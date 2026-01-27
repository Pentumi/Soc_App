@echo off
echo ========================================
echo Restarting for Mobile Testing
echo ========================================
echo.
echo Stopping any running servers...
taskkill /F /IM node.exe 2>nul
timeout /t 2
echo.
echo Starting Backend Server...
start "Golf App Backend" cmd /k "cd /d C:\Users\dean\soc-app\server && npm run dev"
echo Waiting for backend to start...
timeout /t 5
echo.
echo Starting Frontend Server...
start "Golf App Frontend" cmd /k "cd /d C:\Users\dean\soc-app\client && npm start"
echo.
echo ========================================
echo Both servers are starting!
echo ========================================
echo.
echo Wait 30 seconds, then on your iPhone go to:
echo.
echo http://192.168.1.37:3000
echo.
echo Your credentials:
echo Email: deanreddy@hotmail.com
echo Password: [your password]
echo.
pause
