@echo off
setlocal

set "PROJECT_DIR=%~dp0"
set "NODE_EXE=C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
set "NPM_CLI=C:\Users\User\Documents\Codex\2026-06-21\next-js-react-typescript-tailwind-css-2\work\package\bin\npm-cli.js"
set "ANDROID_STUDIO_JBR=C:\Program Files\Android\Android Studio\jbr"
set "DEFAULT_ANDROID_SDK=%LOCALAPPDATA%\Android\Sdk"

cd /d "%PROJECT_DIR%"

echo FocusFlow Android APK builder
echo.

if not exist "android\gradlew.bat" (
  echo Android project is missing. Run:
  echo npm run build
  echo npx cap add android
  pause
  exit /b 1
)

where java >nul 2>&1
if errorlevel 1 (
  if exist "%ANDROID_STUDIO_JBR%\bin\java.exe" (
    set "JAVA_HOME=%ANDROID_STUDIO_JBR%"
    set "PATH=%ANDROID_STUDIO_JBR%\bin;%PATH%"
  ) else (
    echo Java / JDK is not installed or not in PATH.
    echo Install Android Studio first, then run this file again.
    echo Download: https://developer.android.com/studio
    pause
    exit /b 1
  )
)

if not defined ANDROID_HOME (
  if exist "%DEFAULT_ANDROID_SDK%" (
    set "ANDROID_HOME=%DEFAULT_ANDROID_SDK%"
    set "ANDROID_SDK_ROOT=%DEFAULT_ANDROID_SDK%"
  )
)

if not defined ANDROID_HOME (
  echo Android SDK was not found.
  echo Open Android Studio once and install the Android SDK, then run this file again.
  pause
  exit /b 1
)

if exist "%NODE_EXE%" (
  "%NODE_EXE%" "%NPM_CLI%" run native:sync
) else (
  npm run native:sync
)

if errorlevel 1 (
  echo Native sync failed.
  pause
  exit /b 1
)

cd /d "%PROJECT_DIR%android"
call gradlew.bat assembleDebug

if errorlevel 1 (
  echo APK build failed. Open Android Studio to install missing SDK tools, then retry.
  pause
  exit /b 1
)

echo.
echo APK is ready:
echo %PROJECT_DIR%android\app\build\outputs\apk\debug\app-debug.apk
echo.
pause
endlocal
