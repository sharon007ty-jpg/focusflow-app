@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "SITE_FILE=%PROJECT_DIR%dist\index.html"
set "CHROME=C:\Program Files\Google\Chrome\Application\chrome.exe"

if not exist "%SITE_FILE%" (
  echo dist\index.html not found. Please run build first.
  pause
  exit /b 1
)

if exist "%CHROME%" (
  start "FocusFlow React Direct" "%CHROME%" "%SITE_FILE%"
) else (
  start "FocusFlow React Direct" "%SITE_FILE%"
)

endlocal
