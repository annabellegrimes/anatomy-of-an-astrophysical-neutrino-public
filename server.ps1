<#
  Local web server for "Anatomy of an Astrophysical Neutrino".
  Serves the files in .\public at http://localhost:3000 using only what ships with Windows.

  Usage:  powershell -ExecutionPolicy Bypass -File server.ps1 [-Port 3000] [-NoBrowser]
  Stop it with Ctrl+C or by closing the window.
#>
param(
  [int]$Port = 3000,
  [switch]$NoBrowser
)

$ErrorActionPreference = 'Stop'
$root = [System.IO.Path]::GetFullPath((Join-Path $PSScriptRoot 'public'))
$url = "http://localhost:$Port/"

$mime = @{
  '.html' = 'text/html; charset=utf-8'
  '.css'  = 'text/css; charset=utf-8'
  '.js'   = 'text/javascript; charset=utf-8'
  '.json' = 'application/json; charset=utf-8'
  '.svg'  = 'image/svg+xml'
  '.png'  = 'image/png'
  '.jpg'  = 'image/jpeg'
  '.ico'  = 'image/x-icon'
  '.woff2'= 'font/woff2'
  '.woff' = 'font/woff'
  '.txt'  = 'text/plain; charset=utf-8'
}

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($url)
try {
  $listener.Start()
} catch {
  Write-Host ""
  Write-Host "Could not start the server on port $Port." -ForegroundColor Red
  Write-Host "Something else is probably using it. Close that program, or run:" -ForegroundColor Red
  Write-Host "  start.bat 3001" -ForegroundColor Yellow
  Write-Host ""
  exit 1
}

Write-Host ""
Write-Host "  Anatomy of an Astrophysical Neutrino" -ForegroundColor Cyan
Write-Host "  Serving $root"
Write-Host "  Open $url in your browser." -ForegroundColor Green
Write-Host "  Press Ctrl+C or close this window to stop."
Write-Host ""

if (-not $NoBrowser) { Start-Process $url }

try {
  while ($listener.IsListening) {
    # Poll so that Ctrl+C is noticed between requests.
    $pending = $listener.GetContextAsync()
    while (-not $pending.AsyncWaitHandle.WaitOne(250)) { }
    $ctx = $pending.GetAwaiter().GetResult()
    $req = $ctx.Request
    $res = $ctx.Response
    try {
      $rel = [System.Uri]::UnescapeDataString($req.Url.AbsolutePath).TrimStart('/')
      if ($rel -eq '' -or $rel.EndsWith('/')) { $rel = $rel + 'index.html' }
      $path = [System.IO.Path]::GetFullPath((Join-Path $root $rel))

      # Never serve anything outside .\public
      if (-not $path.StartsWith($root + [System.IO.Path]::DirectorySeparatorChar, [System.StringComparison]::OrdinalIgnoreCase) -or
          -not (Test-Path -LiteralPath $path -PathType Leaf)) {
        $res.StatusCode = 404
        $body = [System.Text.Encoding]::UTF8.GetBytes('Not found')
        $res.ContentType = 'text/plain; charset=utf-8'
      } else {
        $ext = [System.IO.Path]::GetExtension($path).ToLowerInvariant()
        $res.ContentType = if ($mime.ContainsKey($ext)) { $mime[$ext] } else { 'application/octet-stream' }
        $res.Headers['Cache-Control'] = 'no-cache'
        $body = [System.IO.File]::ReadAllBytes($path)
      }
      $res.ContentLength64 = $body.Length
      if ($req.HttpMethod -ne 'HEAD') { $res.OutputStream.Write($body, 0, $body.Length) }
      Write-Host ("{0}  {1}  /{2}" -f (Get-Date -Format 'HH:mm:ss'), $res.StatusCode, $rel)
    } catch {
      try { $res.StatusCode = 500 } catch { }
    } finally {
      $res.OutputStream.Close()
    }
  }
} finally {
  $listener.Stop()
  $listener.Close()
  Write-Host "Server stopped."
}
