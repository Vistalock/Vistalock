# start_local_db.ps1
$pgBin = "C:\Program Files\PostgreSQL\17\bin"
$dataDir = "$PSScriptRoot\..\..\postgres_data_local"
$logFile = "$PSScriptRoot\..\..\logs\pg_local.log"
$port = 5434

Write-Host "Setting up local isolated DB on port $port..." -ForegroundColor Cyan

# Initialize DB if data dir doesn't exist
if (-not (Test-Path $dataDir)) {
    Write-Host "Initializing database in $dataDir..."
    & "$pgBin\initdb.exe" -D $dataDir -U postgres --auth=trust --no-locale --encoding=UTF8
}
else {
    Write-Host "Database directory already exists."
}

# Start DB
Write-Host "Starting database server..."
& "$pgBin\pg_ctl.exe" -D $dataDir -l $logFile -o "-p $port" start

# Wait for startup
Start-Sleep -Seconds 3

# Create vistalock_local DB
Write-Host "Creating vistalock_local database..."
& "$pgBin\psql.exe" -h localhost -p $port -U postgres -d postgres -c "CREATE DATABASE vistalock_local;" -w

Write-Host "Database Ready on port $port!" -ForegroundColor Green
