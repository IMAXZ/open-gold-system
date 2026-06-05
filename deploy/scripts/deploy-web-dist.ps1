[CmdletBinding()]
param(
  [string]$ServerHost = "120.48.88.219",

  [string]$User = "root",

  [string]$TargetDir = "/usr/app/gold-chart",

  [int]$Port = 22,

  [string]$DistDir = "apps/web/dist",

  [string]$RemoteTempDir = "/tmp/open-gold-web-deploy",

  [switch]$UseSudo,

  [switch]$SkipBuild
)

$ErrorActionPreference = "Stop"

function Write-Step {
  param([string]$Message)
  Write-Host "==> $Message" -ForegroundColor Cyan
}

function Test-CommandExists {
  param([string]$Name)

  return $null -ne (Get-Command $Name -ErrorAction SilentlyContinue)
}

function Invoke-Native {
  param(
    [Parameter(Mandatory = $true)]
    [string]$FilePath,

    [Parameter()]
    [string[]]$Arguments = @()
  )

  & $FilePath @Arguments
  if ($LASTEXITCODE -ne 0) {
    throw "Command failed: $FilePath $($Arguments -join ' ')"
  }
}

if (-not (Test-CommandExists "ssh")) {
  throw "ssh command not found. Please install OpenSSH client first."
}

if (-not (Test-CommandExists "scp")) {
  throw "scp command not found. Please install OpenSSH client first."
}

if (-not (Test-CommandExists "tar")) {
  throw "tar command not found. Please make sure tar is available."
}

$workspaceRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$resolvedDistDir = Join-Path $workspaceRoot $DistDir

if (-not $SkipBuild) {
  Write-Step "Build web assets"
  Push-Location (Join-Path $workspaceRoot "apps/web")
  try {
    npm run build
  }
  finally {
    Pop-Location
  }
}

if (-not (Test-Path $resolvedDistDir)) {
  throw "Dist directory not found: $resolvedDistDir"
}

$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$archiveName = "web-dist-$timestamp.tar.gz"
$localArchivePath = Join-Path ([System.IO.Path]::GetTempPath()) $archiveName
$remoteArchivePath = "$RemoteTempDir/$archiveName"
$remoteReleaseDir = "$RemoteTempDir/release-$timestamp"
$remoteBackupDir = "$TargetDir.backup-$timestamp"
$sudoPrefix = if ($UseSudo) { "sudo " } else { "" }

if (Test-Path $localArchivePath) {
  Remove-Item -LiteralPath $localArchivePath -Force
}

Write-Step "Create dist archive"
Invoke-Native -FilePath "tar" -Arguments @("-czf", $localArchivePath, "-C", $resolvedDistDir, ".")

Write-Step "Create remote temp directory"
Invoke-Native -FilePath "ssh" -Arguments @("-p", $Port, "${User}@${ServerHost}", "mkdir -p '$RemoteTempDir'")

Write-Step "Upload archive"
Invoke-Native -FilePath "scp" -Arguments @("-P", $Port, $localArchivePath, "${User}@${ServerHost}:$remoteArchivePath")

$remoteCommands = @(
  "set -e"
  "${sudoPrefix}mkdir -p '$remoteReleaseDir'"
  "${sudoPrefix}tar -xzf '$remoteArchivePath' -C '$remoteReleaseDir'"
  "if [ -d '$TargetDir' ]; then ${sudoPrefix}mv '$TargetDir' '$remoteBackupDir'; fi"
  "${sudoPrefix}mkdir -p `$(dirname '$TargetDir')"
  "${sudoPrefix}mv '$remoteReleaseDir' '$TargetDir'"
  "${sudoPrefix}rm -f '$remoteArchivePath'"
  "echo 'backup_dir=$remoteBackupDir'"
)

$remoteCommand = $remoteCommands -join "; "

Write-Step "Replace remote directory"
Invoke-Native -FilePath "ssh" -Arguments @("-p", $Port, "${User}@${ServerHost}", $remoteCommand)

Write-Step "Remove local temp archive"
Remove-Item -LiteralPath $localArchivePath -Force

Write-Host ""
Write-Host "Deploy completed." -ForegroundColor Green
Write-Host "Remote target: $TargetDir"
Write-Host "Rollback backup: $remoteBackupDir"
