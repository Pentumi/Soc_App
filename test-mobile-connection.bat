@echo off
echo ========================================
echo Testing Mobile Connection
echo ========================================
echo.
echo Testing Backend API...
curl -X POST http://172.20.10.9:5000/api/auth/login -H "Content-Type: application/json" -d "{\"email\":\"deanreddy@hotmail.com\",\"password\":\"test\"}"
echo.
echo.
echo If you see a response above, the backend is accessible.
echo If you see "Connection refused" or timeout, check Windows Firewall.
echo.
pause
