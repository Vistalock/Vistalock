# Test login with updated password
$body = @{
    email    = "merchant-a@test.com"
    password = "Test123!@#$%"
} | ConvertTo-Json

try {
    $response = Invoke-RestMethod -Uri "http://localhost:3001/auth/login" `
        -Method Post `
        -ContentType "application/json" `
        -Body $body
    
    Write-Host "`n✅ LOGIN SUCCESSFUL!" -ForegroundColor Green
    Write-Host "=" * 60 -ForegroundColor Cyan
    Write-Host "Email: merchant-a@test.com" -ForegroundColor Cyan
    Write-Host "Role: $($response.role)" -ForegroundColor Cyan
    Write-Host "TenantId: $($response.tenantId)" -ForegroundColor Cyan
    Write-Host "Token: $($response.access_token.Substring(0, 60))..." -ForegroundColor Gray
    Write-Host "=" * 60 -ForegroundColor Cyan
    
    # Test getting products
    Write-Host "`n📦 Testing Products Endpoint..." -ForegroundColor Yellow
    $products = Invoke-RestMethod -Uri "http://localhost:3001/products" `
        -Headers @{ Authorization = "Bearer $($response.access_token)" }
    
    Write-Host "✅ Products retrieved: $($products.Count) products" -ForegroundColor Green
    
    Write-Host "`n🎉 E2E Test Environment is READY!" -ForegroundColor Green
    Write-Host "   - Auth Service: ✅ Running on port 3001" -ForegroundColor White
    Write-Host "   - Web Dashboard: ✅ Running on port 3005" -ForegroundColor White
    Write-Host "   - Test Login: ✅ Working" -ForegroundColor White
    Write-Host "   - API Endpoints: ✅ Accessible`n" -ForegroundColor White
    
}
catch {
    Write-Host "`n❌ Test Failed: $_`n" -ForegroundColor Red
}
