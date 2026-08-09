$baseUrl = "http://localhost:5000"
$hasFailed = $false

function Test-Endpoint {
    param([string]$Method, [string]$Url, [string]$Body)
    try {
        if ($Body) {
            $response = Invoke-WebRequest -Method $Method -Uri "$baseUrl$Url" -Body $Body -ContentType "application/json" -UseBasicParsing
        } else {
            $response = Invoke-WebRequest -Method $Method -Uri "$baseUrl$Url" -UseBasicParsing
        }
        Write-Host "[$Method] $Url - Status: $($response.StatusCode) - PASS"
    } catch {
        $hasFailed = $true
        $status = $_.Exception.Response.StatusCode.value__
        if (-not $status) { $status = "Connection Error" }
        Write-Host "[$Method] $Url - Status: $status - FAIL"
        try {
            $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
            $errBody = $reader.ReadToEnd()
            Write-Host "Error Body: $errBody"
        } catch {}
    }
}

Write-Host "Testing endpoints..."
Test-Endpoint -Method GET -Url "/api/health"
Test-Endpoint -Method GET -Url "/api/complaints"
Test-Endpoint -Method POST -Url "/api/complaints" -Body '{"rawText":"Broken street light near central park","area":"Navrangpura"}'
Test-Endpoint -Method GET -Url "/api/social/feed"
Test-Endpoint -Method POST -Url "/api/social/scrape"
Test-Endpoint -Method GET -Url "/api/analytics"
Test-Endpoint -Method GET -Url "/api/analytics/area"

if ($hasFailed) {
    Write-Host "`nSome tests failed."
    exit 1
} else {
    Write-Host "`nAll tests passed successfully."
    exit 0
}
