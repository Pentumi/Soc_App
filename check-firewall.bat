@echo off
echo ========================================
echo Windows Firewall Check
echo ========================================
echo.
echo Opening Windows Firewall settings...
echo.
echo Please make sure Node.js is allowed on:
echo   - Private networks (checked)
echo   - Public networks (optional)
echo.
start ms-settings:network-firewall
pause
