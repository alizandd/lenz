@echo off
echo ============================================
echo    Lenz TV - اجرا روی دستگاه
echo ============================================
echo.

echo [1/3] بررسی اتصال دستگاه...
adb devices
echo.

echo [2/3] شروع Metro Bundler...
echo این پنجره را باز نگه دارید!
echo.
start cmd /k "npm start"

echo [3/3] لطفا 10 ثانیه صبر کنید...
timeout /t 10 /nobreak

echo.
echo حالا React Native را اجرا می‌کنیم...
echo.

npx react-native run-android --deviceId 172.16.10.11:5555

echo.
echo اگر خطا گرفتید، Android Studio را باز کنید و:
echo 1. File -^> Open -^> D:\ali\android\Lenz\android
echo 2. منتظر Gradle Sync بمانید
echo 3. دکمه Run را بزنید
echo.

pause





