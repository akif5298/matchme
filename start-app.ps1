Write-Host "Starting MatchMe Application..." -ForegroundColor Green
Write-Host ""

Write-Host "Starting Backend Server..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'matchme\backend'; npm start" -WindowStyle Normal

Write-Host "Waiting 3 seconds for backend to initialize..." -ForegroundColor Cyan
Start-Sleep -Seconds 3

Write-Host "Starting Mobile App..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'matchme\mobile-expo'; npm start" -WindowStyle Normal

Write-Host ""
Write-Host "Both services are starting..." -ForegroundColor Green
Write-Host "- Backend will be available at http://localhost:3000" -ForegroundColor White
Write-Host "- Mobile app will show QR code for Expo Go" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to close this window..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown") 