# Saatlik otomatik yedek push betiği
# İki ayrı git deposunu sırayla push eder.

param(
  [string]$FrontendPath = "E:\satinalma",
  [string]$BackendPath = "E:\satinalma-backend"
)

$ErrorActionPreference = 'Stop'

function Push-Repo($path) {
  Write-Host "`n==> Pushing repo: $path" -ForegroundColor Cyan
  if (-Not (Test-Path $path)) { Write-Warning "Path not found: $path"; return }
  Push-Location $path
  try {
    git rev-parse --is-inside-work-tree | Out-Null
  } catch {
    Write-Warning "Not a git repo: $path"; Pop-Location; return
  }

  $branch = (git branch --show-current).Trim()
  if (-Not $branch) { Write-Warning "No current branch in $path"; Pop-Location; return }

  # Opsiyonel: otomatik add/commit (yalnızca çalışma dizini temiz değilse küçük bir snapshot al)
  $status = git status --porcelain
  if ($status) {
    Write-Host "Uncommitted changes detected; creating snapshot commit" -ForegroundColor Yellow
    git add -A
    $msg = "Auto backup: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
    git commit -m $msg | Out-Null
  }

  git push | Write-Host
  Pop-Location
}

Push-Repo -path $FrontendPath
Push-Repo -path $BackendPath

Write-Host "`nAll pushes attempted." -ForegroundColor Green
