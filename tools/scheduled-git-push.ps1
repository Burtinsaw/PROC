param(
  [string[]]$Repos = @("E:\satinalma","E:\satinalma-backend"),
  [switch]$DryRun
)

$ErrorActionPreference = 'Stop'

function Push-Repo {
  param([string]$Path)
  if (-not (Test-Path -LiteralPath $Path)) { Write-Warning "Path not found: $Path"; return }
  if (-not (Test-Path -LiteralPath (Join-Path $Path '.git'))) { Write-Warning "Not a git repo: $Path"; return }
  Write-Host "`n=== Processing $Path ==="
  Push-Location -LiteralPath $Path
  try {
    if ($DryRun) { Write-Host '[DRYRUN] Skipping git operations'; return }
    # Optional: fetch to be aware of remote state (ignore errors)
    try { git fetch --all --prune | Out-Host } catch { Write-Warning "fetch failed: $($_.Exception.Message)" }
    $changes = git status --porcelain
    if ([string]::IsNullOrWhiteSpace($changes)) {
      Write-Host 'No local changes to commit.'
    } else {
      Write-Host 'Staging and committing local changes...'
      git add -A | Out-Host
      $msg = "chore(auto): daily sync $(Get-Date -Format 'yyyy-MM-dd HH:mm')"
      git commit -m $msg | Out-Host
    }
    Write-Host 'Pushing to remote...'
    git push | Out-Host
  } catch {
    Write-Warning "Push-Repo failed for $Path: $($_.Exception.Message)"
  } finally {
    Pop-Location
  }
}

foreach($repo in $Repos){ Push-Repo -Path $repo }
