param([switch]$RunTests)
$ErrorActionPreference = 'Stop'

$logDir = "E:\satinalma\tools\logs"
if (!(Test-Path $logDir)) { New-Item -ItemType Directory -Force -Path $logDir | Out-Null }
$log = Join-Path $logDir ("git_" + (Get-Date -Format "yyyyMMdd") + ".log")

function Write-Log($msg) {
  $line = "[{0}] {1}" -f (Get-Date -Format "HH:mm:ss"), $msg
  $line | Tee-Object -FilePath $log -Append | Out-Null
}

function Invoke-GitOps([string]$path, [string]$name, [string]$testCmd, [string]$cwdForTest) {
  Write-Log "---- $name ($path) ----"
  if (!(Test-Path $path)) { Write-Log "Path yok, geçiliyor."; return }
  Set-Location $path
  if (!(Test-Path ".git")) { Write-Log "Git repo değil, geçiliyor."; return }
  try {
    git fetch --all --prune | Out-Null
    $branch = (git rev-parse --abbrev-ref HEAD).Trim()
    Write-Log "Aktif branch: $branch"

    $changes = git status --porcelain
    if ($changes) {
      Write-Log "Yerel değişiklikler var, commit edilecek."
      git add -A
      $msg = "Auto-commit: daily sync ($([DateTime]::Now.ToString('yyyy-MM-dd HH:mm')))"
      git commit -m $msg | Out-Null
    } else {
      Write-Log "Yerel değişiklik yok."
    }

    Write-Log "Remote ile senkron (pull --rebase)..."
    git pull --rebase

    if ($RunTests -and $testCmd) {
      Write-Log "Testler çalıştırılıyor: $testCmd"
      Push-Location $cwdForTest
      try {
  Invoke-Expression $testCmd
        if ($LASTEXITCODE -ne 0) { throw "Testler başarısız (exit $LASTEXITCODE)" }
        Write-Log "Testler başarılı."
      } catch { Write-Log "Test hatası: $($_.Exception.Message)"; throw }
      finally { Pop-Location }
    }

    Write-Log "Push..."
    git push
    Write-Log "✅ Tamam: $name"
  } catch {
    Write-Log "❌ Hata: $($_.Exception.Message)"
  }
}

Invoke-GitOps "E:\satinalma" "frontend" "npm run test:ci" "E:\satinalma"
Invoke-GitOps "E:\satinalma-backend" "backend" "npm test --silent" "E:\satinalma-backend"
