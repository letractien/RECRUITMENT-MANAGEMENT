# Clean up script for Docker-based development
Write-Host "Cleaning up project for Docker-based development..." -ForegroundColor Green

# Remove node_modules
if (Test-Path "node_modules") {
    Write-Host "Removing node_modules directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "node_modules"
}

# Remove any dist directory that might exist
if (Test-Path "dist") {
    Write-Host "Removing dist directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "dist"
}

# Remove any build cache
if (Test-Path ".cache") {
    Write-Host "Removing .cache directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force ".cache"
}

# Remove any coverage reports
if (Test-Path "coverage") {
    Write-Host "Removing coverage directory..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force "coverage"
}

# Remove temporary files in the project
Write-Host "Removing temporary files..." -ForegroundColor Yellow
Get-ChildItem -Path . -Include *.tmp, *.temp, *.bak, *.log -File -Recurse -ErrorAction SilentlyContinue | ForEach-Object {
    Write-Host "Removing $($_.FullName)" -ForegroundColor Gray
    Remove-Item -Force $_.FullName
}

# Remove any local environment files (make sure these are backed up if needed)
$envFiles = @(".env.local", ".env.development.local", ".env.test.local", ".env.production.local")
foreach ($file in $envFiles) {
    if (Test-Path $file) {
        Write-Host "Removing $file..." -ForegroundColor Yellow
        Remove-Item -Force $file
    }
}

# Clean JavaScript compilation artifacts if any exist
Write-Host "Removing JavaScript compilation artifacts..." -ForegroundColor Yellow
if (Test-Path "src/**/*.js.map") {
    Get-ChildItem -Path "src" -Include *.js.map -File -Recurse | ForEach-Object {
        Write-Host "Removing $($_.FullName)" -ForegroundColor Gray
        Remove-Item -Force $_.FullName
    }
}

# Clean npm cache if needed
Write-Host "Cleaning npm cache..." -ForegroundColor Yellow
npm cache clean --force

# Create a .dockerignore if it doesn't exist
if (-not (Test-Path ".dockerignore")) {
    Write-Host "Creating .dockerignore file..." -ForegroundColor Yellow
    @"
node_modules
dist
.cache
coverage
*.log
.git
.gitignore
README.md
Dockerfile
docker-compose.yml
docker-compose.dev.yml
.env
.env.*
"@ | Out-File -FilePath ".dockerignore" -Encoding utf8
}

Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Your project is now optimized for Docker-based development." -ForegroundColor Cyan 