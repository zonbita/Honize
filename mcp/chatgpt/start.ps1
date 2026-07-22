<#
.SYNOPSIS
  Start private ChatGPT Local Coder MCP for the Honize workspace.

.DESCRIPTION
  Clones/builds chatgpt-local-coder into mcp/chatgpt/.runtime (gitignored),
  loads mcp/chatgpt/.env, and serves Streamable HTTP at http://localhost:3000/mcp

  This is PRIVATE: use ChatGPT Developer Mode connector only — do not publish.
#>

$ErrorActionPreference = 'Stop'
$Root = Split-Path -Parent $MyInvocation.MyCommand.Path
$RepoRoot = Resolve-Path (Join-Path $Root '..\..')
$Runtime = Join-Path $Root '.runtime'
$EnvFile = Join-Path $Root '.env'
$EnvExample = Join-Path $Root '.env.example'
$RepoUrl = 'https://github.com/hoangcoderr/chatgpt-local-coder.git'

if (-not (Test-Path $EnvFile)) {
  Copy-Item $EnvExample $EnvFile
  Write-Host "Created $EnvFile — WORKSPACE_PATH already points at Honize." -ForegroundColor Yellow
}

# Load .env into process
Get-Content $EnvFile | ForEach-Object {
  $line = $_.Trim()
  if (-not $line -or $line.StartsWith('#')) { return }
  $i = $line.IndexOf('=')
  if ($i -lt 1) { return }
  $key = $line.Substring(0, $i).Trim()
  $val = $line.Substring($i + 1).Trim()
  [Environment]::SetEnvironmentVariable($key, $val, 'Process')
  Set-Item -Path "Env:$key" -Value $val
}

if (-not $env:WORKSPACE_PATH) {
  $env:WORKSPACE_PATH = "$RepoRoot"
}

if (-not (Test-Path (Join-Path $Runtime 'package.json'))) {
  Write-Host "Cloning chatgpt-local-coder into $Runtime ..." -ForegroundColor Cyan
  New-Item -ItemType Directory -Force -Path $Root | Out-Null
  git clone --depth 1 $RepoUrl $Runtime
  Push-Location $Runtime
  npm install
  npm run build
  Pop-Location
}

Write-Host ""
Write-Host "MCP (private):  http://localhost:$($env:PORT)/mcp" -ForegroundColor Green
Write-Host "Workspace:      $($env:WORKSPACE_PATH)" -ForegroundColor Green
Write-Host ""
Write-Host "Next:" -ForegroundColor Cyan
Write-Host "  1) Keep this window open"
Write-Host "  2) Expose HTTPS tunnel (OpenAI Secure Tunnel or cloudflared) → URL must end with /mcp"
Write-Host "  3) ChatGPT → Settings → Apps & Connectors → enable Developer mode → Create connector (private)"
Write-Host "  4) In each chat: @Honize Local Coder before asking to code"
Write-Host ""

Push-Location $Runtime
# Prefer runtime's start if present; fallback to npm start
if (Test-Path '.\start.ps1') {
  & .\start.ps1
} else {
  npm start
}
Pop-Location
