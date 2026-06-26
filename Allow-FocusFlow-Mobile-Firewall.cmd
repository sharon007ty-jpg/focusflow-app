@echo off
setlocal

net session >nul 2>&1
if not "%errorlevel%"=="0" (
  echo FocusFlow needs administrator permission to add a Windows firewall rule.
  echo A permission window will open. Please click Yes.
  powershell -NoProfile -ExecutionPolicy Bypass -Command "Start-Process -FilePath '%~f0' -Verb RunAs"
  exit /b
)

echo Adding Windows firewall rule for FocusFlow mobile access...
netsh advfirewall firewall delete rule name="FocusFlow Mobile 5191" >nul 2>&1
netsh advfirewall firewall add rule name="FocusFlow Mobile 5191" dir=in action=allow protocol=TCP localport=5191 profile=private,public

echo.
echo Done. Your phone can try:
echo http://172.16.100.2:5191/
echo.
pause
endlocal
