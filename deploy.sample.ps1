<#
Frontend build & deploy sample script
#>
param(
  [string]$Branch='main'
)
Write-Host "=== Frontend Deploy ($Branch) ===" -ForegroundColor Cyan

git fetch origin $Branch
git checkout $Branch
git pull origin $Branch

if (-Not (Test-Path .env.production)) {
  if (Test-Path .env.production.example) { Copy-Item .env.production.example .env.production }
  Write-Warning ".env.production created from example – edit values!"
}

npm ci
npm run build
Write-Host "Build complete -> dist/" -ForegroundColor Green
