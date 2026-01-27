@echo off
echo ========================================
echo Mobile Connection Diagnostics
echo ========================================
echo.

echo 1. Testing Backend Health Endpoint...
curl -s http://192.168.1.37:5000/health
echo.
echo.

echo 2. Testing Login Endpoint (should return 400 or JSON error)...
curl -s -X POST http://192.168.1.37:5000/api/auth/login -H "Content-Type: application/json" -d "{}"
echo.
echo.

echo 3. Checking CORS Configuration...
type server\.env | findstr ALLOWED_ORIGINS
echo.
echo.

echo 4. Checking Frontend Configuration...
type client\.env
echo.
echo.

echo 5. Testing if frontend is accessible...
curl -s http://192.168.1.37:3000 | findstr /C:"Golf Society" >nul
if %errorlevel%==0 (
    echo Frontend is ACCESSIBLE on http://192.168.1.37:3000
) else (
    echo Frontend is NOT accessible. Make sure it's running with HOST=0.0.0.0
)
echo.
echo.

echo ========================================
echo Diagnostics Complete
echo ========================================
echo.
echo If you see errors above, follow these steps:
echo 1. Stop both servers (Ctrl+C)
echo 2. Restart backend: cd server ^&^& npm run dev
echo 3. Restart frontend: cd client ^&^& npm start
echo 4. Try login again on iPhone
echo.
pause
