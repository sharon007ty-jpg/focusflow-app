@echo off
setlocal

set "PORT=5190"
set "PROJECT_DIR=%~dp0"
set "PYTHON_EXE=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\python\python.exe"
set "SITE_FILE=%PROJECT_DIR%dist\index.html"
set "URL=http://127.0.0.1:%PORT%/"

echo Starting FocusFlow React app...
cd /d "%PROJECT_DIR%"

if not exist "dist\index.html" (
  echo dist not found. Please run npm run build first.
  pause
  exit /b 1
)

echo.
echo Local link:
echo %URL%
echo.
echo Starting local server in this window...
echo Keep this black window open while using FocusFlow.
echo.
echo Open Chrome and visit:
echo %URL%
echo.

if exist "%PYTHON_EXE%" (
  "%PYTHON_EXE%" -m http.server %PORT% --bind 127.0.0.1 --directory "%PROJECT_DIR%dist"
) else (
  python -m http.server %PORT% --bind 127.0.0.1 --directory "%PROJECT_DIR%dist"
)

endlocal
