# Force delete the old merchant-agent folder
$oldPath = "C:\Users\abc\OneDrive\Desktop\Vistalock\merchant-agent"

Write-Host "Attempting to delete: $oldPath" -ForegroundColor Yellow

# Kill any processes that might be locking files
Write-Host "Stopping Node processes..." -ForegroundColor Cyan
Get-Process -Name node -ErrorAction SilentlyContinue | Stop-Process -Force -ErrorAction SilentlyContinue

# Wait a moment
Start-Sleep -Seconds 2

# Try to delete
try {
    if (Test-Path $oldPath) {
        Remove-Item -Path $oldPath -Recurse -Force -ErrorAction Stop
        Write-Host "✅ Successfully deleted old merchant-agent folder!" -ForegroundColor Green
    }
    else {
        Write-Host "✅ Folder doesn't exist (already deleted)" -ForegroundColor Green
    }
}
catch {
    Write-Host "❌ Failed to delete. Error: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "`nPlease restart your computer and run this script again." -ForegroundColor Yellow
}

Write-Host "`n📱 Standalone app location: C:\Users\abc\OneDrive\Desktop\merchant-agent" -ForegroundColor Cyan
