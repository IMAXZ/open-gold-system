[CmdletBinding()]
param(
  [Parameter(Mandatory = $true)]
  [string]$ServerHost,

  [string]$User = "root",

  [int]$Port = 22,

  [string]$TargetDir = "/usr/app/gold-collector",

  [string]$RemoteTempDir = "/tmp/open-gold-dotnet-deploy",

  [string]$ImageName = "open-gold-system-dotnet",

  [string]$ImageTag = "latest",

  [string]$ContainerName = "gold-collector-dotnet",

  [int]$AppPort = 41736,

  [string]$Dockerfile = "deploy/docker/Dockerfile",

  [string]$Platform = "",

  [switch]$UseSudo,

  [switch]$SkipBuild,

  [switch]$KeepRemoteArchive
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

foreach ($command in @("docker", "ssh", "scp")) {
  if (-not (Test-CommandExists $command)) {
    throw "$command command not found."
  }
}

$workspaceRoot = Split-Path -Parent (Split-Path -Parent $PSScriptRoot)
$resolvedDockerfile = Join-Path $workspaceRoot $Dockerfile

if (-not (Test-Path $resolvedDockerfile)) {
  throw "Dockerfile not found: $resolvedDockerfile"
}

$fullImageName = "${ImageName}:${ImageTag}"
$timestamp = Get-Date -Format "yyyyMMddHHmmss"
$archiveName = "${ImageName}-${timestamp}.tar"
$localArchivePath = Join-Path ([System.IO.Path]::GetTempPath()) $archiveName
$remoteArchivePath = "$RemoteTempDir/$archiveName"
$remoteEnvFile = "$TargetDir/.env"
$remoteLogsDir = "$TargetDir/logs"
$sudoPrefix = if ($UseSudo) { "sudo " } else { "" }

if (Test-Path $localArchivePath) {
  Remove-Item -LiteralPath $localArchivePath -Force
}

if (-not $SkipBuild) {
  Write-Step "Build docker image: $fullImageName"
  $buildArguments = @("build", "-f", $resolvedDockerfile, "-t", $fullImageName)
  if ($Platform) {
    $buildArguments += @("--platform", $Platform)
  }
  $buildArguments += $workspaceRoot
  Invoke-Native -FilePath "docker" -Arguments $buildArguments
}

Write-Step "Export docker image"
Invoke-Native -FilePath "docker" -Arguments @("save", $fullImageName, "-o", $localArchivePath)

Write-Step "Create remote temp directory"
Invoke-Native -FilePath "ssh" -Arguments @("-p", $Port, "${User}@${ServerHost}", "mkdir -p '$RemoteTempDir'")

Write-Step "Upload docker archive"
Invoke-Native -FilePath "scp" -Arguments @("-P", $Port, $localArchivePath, "${User}@${ServerHost}:$remoteArchivePath")

$remoteCommands = @(
  "set -e"
  "${sudoPrefix}mkdir -p '$TargetDir'"
  "${sudoPrefix}mkdir -p '$remoteLogsDir'"
  "${sudoPrefix}docker load -i '$remoteArchivePath'"
  "if ${sudoPrefix}docker ps -a --format '{{.Names}}' | grep -Fx '$ContainerName' >/dev/null 2>&1; then ${sudoPrefix}docker rm -f '$ContainerName'; fi"
  "${sudoPrefix}docker run -d --name '$ContainerName' --restart always --network host --env-file '$remoteEnvFile' -e ASPNETCORE_ENVIRONMENT=Production -e ASPNETCORE_URLS=http://0.0.0.0:$AppPort -e TZ=Asia/Shanghai -v '${remoteLogsDir}:/app/logs' '$fullImageName'"
  "if [ '$($KeepRemoteArchive.IsPresent.ToString().ToLower())' != 'true' ]; then ${sudoPrefix}rm -f '$remoteArchivePath'; fi"
  "${sudoPrefix}docker ps --filter name='$ContainerName'"
)

$remoteCommand = $remoteCommands -join "; "

Write-Step "Load image and restart container"
Invoke-Native -FilePath "ssh" -Arguments @("-p", $Port, "${User}@${ServerHost}", $remoteCommand)

if (Test-Path $localArchivePath) {
  Write-Step "Remove local temporary archive"
  Remove-Item -LiteralPath $localArchivePath -Force
}

Write-Host ""
Write-Host "Deploy completed." -ForegroundColor Green
Write-Host "Image: $fullImageName"
Write-Host "Container: $ContainerName"
Write-Host "Server: $User@$ServerHost"
Write-Host "Env file expected on server: $remoteEnvFile"
