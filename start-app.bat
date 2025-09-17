@echo off
echo Starting MatchMe Application...
echo.

echo Starting Backend Server...
start "Backend Server" cmd /k "cd matchme\backend && npm start"

echo Waiting 3 seconds for backend to initialize...
timeout /t 3 /nobreak > nul

echo Starting Mobile App...
start "Mobile App" cmd /k "cd matchme\mobile-expo && npm start"

echo.
echo Both services are starting...
echo - Backend will be available at http://localhost:3000
echo - Mobile app will show QR code for Expo Go
echo.
echo Press any key to close this window...
pause > nul 