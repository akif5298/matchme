# Restart Script for MatchMe App
# This script restarts both the backend and mobile app

Write-Host "🔄 Restarting MatchMe App..." -ForegroundColor Cyan

# Kill any existing processes
Write-Host "📱 Stopping mobile app..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null
taskkill /f /im expo.exe 2>$null

Write-Host "🔧 Stopping backend server..." -ForegroundColor Yellow
taskkill /f /im node.exe 2>$null

# Wait a moment for processes to stop
Start-Sleep -Seconds 2

# Start backend server
Write-Host "🚀 Starting backend server..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\akifr\Desktop\Coding\Projects\ShadeMatch\matchme\backend'; npm start" -WindowStyle Normal

# Wait for backend to start
Start-Sleep -Seconds 3

# Start mobile app
Write-Host "📱 Starting mobile app..." -ForegroundColor Green
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'C:\Users\akifr\Desktop\Coding\Projects\ShadeMatch\matchme\mobile-expo'; npm start" -WindowStyle Normal

Write-Host "✅ Both services started!" -ForegroundColor Green
Write-Host "📱 Mobile app: http://localhost:8081" -ForegroundColor Cyan
Write-Host "🔧 Backend: http://localhost:5000" -ForegroundColor Cyan
Write-Host "📱 Scan QR code with Expo Go app" -ForegroundColor Yellow 