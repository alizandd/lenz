@echo off
echo ============================================
echo    Lenz TV - Setup and Installation
echo ============================================
echo.

echo [1/4] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies
    pause
    exit /b 1
)
echo.

echo [2/4] Checking connected devices...
call adb devices
echo.

echo [3/4] Starting Metro Bundler...
echo Please wait, this will open in a new window...
start cmd /k "npm start"
echo.

echo [4/4] Waiting 10 seconds for Metro to start...
timeout /t 10 /nobreak
echo.

echo Ready to build! Choose an option:
echo [1] Run on Android device/emulator
echo [2] Build release APK
echo [3] Exit
echo.
set /p choice=Enter your choice (1-3): 

if "%choice%"=="1" (
    echo.
    echo Building and installing on device...
    call npm run android
    echo.
    echo Done! Check your device for the app.
) else if "%choice%"=="2" (
    echo.
    echo Building release APK...
    cd android
    call gradlew assembleRelease
    cd ..
    echo.
    echo Release APK created at: android\app\build\outputs\apk\release\app-release.apk
) else (
    echo.
    echo Setup complete! Run 'npm run android' when ready.
)

echo.
pause




