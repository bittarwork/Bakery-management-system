# PowerShell script to run database migration
$sqlContent = Get-Content -Path "migrations/add_enhanced_ai_tables.sql" -Raw
$connectionString = "mysql -h shinkansen.proxy.rlwy.net -u root -pZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA --port 24785 --protocol=TCP railway"

# Write SQL content to temporary file
$tempFile = [System.IO.Path]::GetTempFileName() + ".sql"
$sqlContent | Out-File -FilePath $tempFile -Encoding UTF8

try {
    Write-Host "🚀 Starting database migration..."
    $process = Start-Process -FilePath "mysql" -ArgumentList "-h", "shinkansen.proxy.rlwy.net", "-u", "root", "-pZEsGFfzwlnsvgvcUiNsvGraAKFnuVZRA", "--port", "24785", "--protocol=TCP", "railway", "-e", "source $tempFile" -Wait -PassThru -WindowStyle Hidden
    
    if ($process.ExitCode -eq 0) {
        Write-Host "✅ Migration completed successfully!"
    } else {
        Write-Host "❌ Migration failed with exit code: $($process.ExitCode)"
    }
} catch {
    Write-Host "❌ Error running migration: $($_.Exception.Message)"
} finally {
    # Clean up temporary file
    if (Test-Path $tempFile) {
        Remove-Item $tempFile
    }
}

Write-Host "🏁 Migration process finished."