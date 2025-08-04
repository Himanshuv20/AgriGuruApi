#!/usr/bin/env powershell
# AgriGuru API Test Runner
# Automatically detects the running server port and runs all tests

Write-Host "🧪 AgriGuru API Test Runner" -ForegroundColor Green
Write-Host "=" * 50

# Detect running port from .env or default
$port = 3000
if (Test-Path ".env") {
    $envContent = Get-Content ".env"
    $portLine = $envContent | Where-Object { $_ -match "PORT=(\d+)" }
    if ($portLine) {
        $port = [regex]::Match($portLine, "PORT=(\d+)").Groups[1].Value
    }
}

Write-Host "📍 Detected API Port: $port" -ForegroundColor Cyan
Write-Host "🌐 API Base URL: http://localhost:$port" -ForegroundColor Cyan
Write-Host ""

# Set environment variables for tests
$env:PORT = $port
$env:API_BASE = "http://localhost:$port"

# Health check first
Write-Host "🔍 Checking API health..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-RestMethod -Uri "http://localhost:$port/health" -TimeoutSec 5
    Write-Host "✅ API is healthy!" -ForegroundColor Green
} catch {
    Write-Host "❌ API is not responding. Please start the server first:" -ForegroundColor Red
    Write-Host "   npm start" -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "🚀 Running all tests..." -ForegroundColor Yellow
Write-Host ""

# Run tests
$tests = @(
    "test-simple.js",
    "test-hindi.js", 
    "test-multilingual.js",
    "test-comprehensive.js"
)

$passed = 0
$failed = 0

foreach ($test in $tests) {
    if (Test-Path $test) {
        Write-Host "🧪 Running $test..." -ForegroundColor Cyan
        try {
            node $test
            if ($LASTEXITCODE -eq 0) {
                $passed++
                Write-Host "✅ $test PASSED" -ForegroundColor Green
            } else {
                $failed++
                Write-Host "❌ $test FAILED" -ForegroundColor Red
            }
        } catch {
            $failed++
            Write-Host "❌ $test ERROR: $_" -ForegroundColor Red
        }
        Write-Host ""
    } else {
        Write-Host "⚠️  $test not found, skipping..." -ForegroundColor Yellow
    }
}

# Summary
Write-Host "📊 TEST SUMMARY" -ForegroundColor Yellow
Write-Host "=" * 20
Write-Host "Passed: $passed" -ForegroundColor Green
Write-Host "Failed: $failed" -ForegroundColor Red
Write-Host "Total:  $($passed + $failed)"

if ($failed -eq 0) {
    Write-Host ""
    Write-Host "🎉 ALL TESTS PASSED!" -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "⚠️  Some tests failed. Check the output above." -ForegroundColor Yellow
}
