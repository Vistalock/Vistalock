# reset_db_password.ps1
Write-Host "Attempting to reset PostgreSQL password..." -ForegroundColor Cyan

$paths = @(
    "C:\Program Files\PostgreSQL\17\bin\psql.exe",
    "C:\Program Files\PostgreSQL\16\bin\psql.exe",
    "C:\Program Files\PostgreSQL\15\bin\psql.exe"
)

$psqlPath = $null
foreach ($path in $paths) {
    if (Test-Path $path) {
        $psqlPath = $path
        break
    }
}

if ($psqlPath) {
    Write-Host "Found psql at: $psqlPath" -ForegroundColor Green
    & $psqlPath -U postgres -c "ALTER USER postgres WITH PASSWORD 'newpassword';"
    
    if ($?) {
        Write-Host "Password reset command executed." -ForegroundColor Green
    } else {
        Write-Host "Command failed. You may need to enter your CURRENT password if prompted." -ForegroundColor Red
    }
} else {
    Write-Host "Could not find psql.exe in standard locations." -ForegroundColor Red
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
