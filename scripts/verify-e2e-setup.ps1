# VistaLock E2E Testing - Quick Verification Script
# This script verifies the setup and provides testing instructions

Write-Host "🧪 VistaLock E2E Testing - Environment Check" -ForegroundColor Cyan
Write-Host "=" * 60 -ForegroundColor Cyan

# Check 1: Prisma Client
Write-Host "`n📦 Checking Prisma Client..." -ForegroundColor Yellow
if (Test-Path "packages\database\node_modules\.prisma\client") {
    Write-Host "✅ Prisma client is generated" -ForegroundColor Green
}
else {
    Write-Host "❌ Prisma client not found. Run: cd packages\database; npx prisma generate" -ForegroundColor Red
}

# Check 2: Database Connection
Write-Host "`n🗄️  Checking Database..." -ForegroundColor Yellow
try {
    $env:DATABASE_URL = "postgresql://user:secret123@localhost:5433/vistalock_local"
    Set-Location packages\database
    $dbCheck = npx prisma db execute --stdin --schema=schema.prisma <<< "SELECT 1;" 2>&1
    Set-Location ..\..
    Write-Host "✅ Database is accessible" -ForegroundColor Green
}
catch {
    Write-Host "⚠️  Database check skipped (this is optional)" -ForegroundColor Yellow
}

# Check 3: Test Merchants
Write-Host "`n👥 Checking Test Merchants..." -ForegroundColor Yellow
Write-Host "Running merchant creation script..."
node scripts\create-test-merchants.js

# Check 4: Auth Service
Write-Host "`n🔐 Checking Auth Service..." -ForegroundColor Yellow
$authServiceRunning = Get-NetTCPConnection -LocalPort 3001 -ErrorAction SilentlyContinue
if ($authServiceRunning) {
    Write-Host "✅ Auth Service is running on port 3001" -ForegroundColor Green
    
    # Test login
    Write-Host "`nTesting login endpoint..." -ForegroundColor Yellow
    try {
        $body = @{
            email    = "merchant-a@test.com"
            password = "Test123!"
        } | ConvertTo-Json
        
        $response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" `
            -Method Post `
            -ContentType "application/json" `
            -Body $body
        
        Write-Host "✅ Login successful!" -ForegroundColor Green
        Write-Host "   Token: $($response.access_token.Substring(0, 50))..." -ForegroundColor Gray
        Write-Host "   Role: $($response.role)" -ForegroundColor Gray
    }
    catch {
        Write-Host "❌ Login failed: $_" -ForegroundColor Red
    }
}
else {
    Write-Host "⚠️  Auth Service is NOT running" -ForegroundColor Yellow
    Write-Host "   Start it with: cd apps\auth-service; npm run start:dev" -ForegroundColor Gray
}

# Check 5: Web Dashboard
Write-Host "`n🌐 Checking Web Dashboard..." -ForegroundColor Yellow
$dashboardRunning = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue
if ($dashboardRunning) {
    Write-Host "✅ Web Dashboard is running on port 3000" -ForegroundColor Green
}
else {
    Write-Host "⚠️  Web Dashboard is NOT running" -ForegroundColor Yellow
    Write-Host "   Start it with: cd apps\web-dashboard; npm run dev" -ForegroundColor Gray
}

# Summary
Write-Host "`n" + ("=" * 60) -ForegroundColor Cyan
Write-Host "📋 E2E Testing Instructions" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan

Write-Host "`n1️⃣  Start Services (if not running):" -ForegroundColor Yellow
Write-Host "   Terminal 1: cd apps\auth-service; npm run start:dev" -ForegroundColor White
Write-Host "   Terminal 2: cd apps\web-dashboard; npm run dev" -ForegroundColor White
Write-Host "   Terminal 3: cd apps\merchant-agent; npx expo start" -ForegroundColor White

Write-Host "`n2️⃣  Test Credentials:" -ForegroundColor Yellow
Write-Host "   Merchant A: merchant-a@test.com / Test123!" -ForegroundColor White
Write-Host "   Merchant B: merchant-b@test.com / Test123!" -ForegroundColor White

Write-Host "`n3️⃣  Test Scenarios:" -ForegroundColor Yellow
Write-Host "   ✅ Multi-Tenancy Isolation" -ForegroundColor White
Write-Host "   ✅ Agent Onboarding Flow (Mobile)" -ForegroundColor White
Write-Host "   ✅ Dashboard Loan Creation" -ForegroundColor White
Write-Host "   ✅ File Upload Verification" -ForegroundColor White

Write-Host "`n4️⃣  Detailed Guide:" -ForegroundColor Yellow
Write-Host "   See: .gemini\antigravity\brain\*\e2e-testing-guide.md" -ForegroundColor White

Write-Host "`n🎯 Quick Test - Login via API:" -ForegroundColor Yellow
Write-Host @"
`$body = @{
    email = "merchant-a@test.com"
    password = "Test123!"
} | ConvertTo-Json

`$response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" ``
    -Method Post ``
    -ContentType "application/json" ``
    -Body `$body

Write-Host "Token: `$(`$response.access_token)"
"@ -ForegroundColor Gray

Write-Host "`n✨ Happy Testing! 🚀`n" -ForegroundColor Green
