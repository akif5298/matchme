@echo off
echo Restarting MatchMe Application...
echo.

echo Stopping any existing processes...
taskkill /f /im node.exe 2>nul
taskkill /f /im expo.exe 2>nul

echo.
echo Starting Backend Server...
start "Backend Server" cmd /k "cd matchme\backend && npm start"

echo Waiting 5 seconds for backend to initialize...
timeout /t 5 /nobreak > nul

echo.
echo Starting Mobile App...
start "Mobile App" cmd /k "cd matchme\mobile-expo && npm start"

echo.
echo Both services are starting...
echo - Backend will be available at http://10.0.0.145:5000
echo - Mobile app will show QR code for Expo Go
echo.
echo IMPORTANT: 
echo 1. Make sure your phone and computer are on the same WiFi network
echo 2. Scan the QR code with Expo Go app
echo 3. If the app doesn't update, try:
echo    - Shake your phone to open developer menu
echo    - Tap "Reload" or "Clear cache and reload"
echo.
echo Press any key to close this window...
pause > nul 