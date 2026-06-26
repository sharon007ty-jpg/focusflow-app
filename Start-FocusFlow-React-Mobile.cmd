@echo off
setlocal

set "PORT=5191"
set "PROJECT_DIR=%~dp0"
set "PYTHON_EXE=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "LAN_IP="

for /f "tokens=2 delims=:" %%A in ('ipconfig ^| findstr /C:"IPv4"') do (
  if not defined LAN_IP set "LAN_IP=%%A"
)

if defined LAN_IP set "LAN_IP=%LAN_IP: =%"

cd /d "%PROJECT_DIR%"

if not exist "dist\index.html" (
  echo dist not found. Please run npm run build first.
  pause
  exit /b 1
)

echo Starting FocusFlow mobile server...
echo.
echo Keep this window open while using FocusFlow on your phone.
echo Phone and computer must be on the same Wi-Fi.
echo.
if defined LAN_IP (
  echo Phone link:
  echo http://%LAN_IP%:%PORT%/
) else (
  echo Could not detect LAN IP. Run ipconfig and use your IPv4 address.
)
echo.

if exist "%PYTHON_EXE%" (
  "%PYTHON_EXE%" -m http.server %PORT% --bind 0.0.0.0 --directory "%PROJECT_DIR%dist"
) else (
  python -m http.server %PORT% --bind 0.0.0.0 --directory "%PROJECT_DIR%dist"
)

endlocal
