@echo off
echo ========================================
echo Building Royal Nano Ceramic for Production
echo ========================================

echo.
echo 1. Cleaning previous build...
if exist "dist" rmdir /s /q "dist"

echo.
echo 2. Installing dependencies...
call npm install

echo.
echo 3. Building for production...
call ng build --configuration production

echo.
echo 4. Copying deployment files...
if exist "dist\royal-nano-ceramic" (
    copy "src\.htaccess" "dist\royal-nano-ceramic\"
    copy "src\robots.txt" "dist\royal-nano-ceramic\"
    copy "src\sitemap.xml" "dist\royal-nano-ceramic\"
    copy "src\manifest.json" "dist\royal-nano-ceramic\"
    copy "src\favicon.ico" "dist\royal-nano-ceramic\"
)

echo.
echo 5. Build completed successfully!
echo.
echo Files ready for upload to GoDaddy:
echo - Upload all contents of: dist\royal-nano-ceramic\
echo - Make sure .htaccess is uploaded
echo - Make sure robots.txt is uploaded
echo - Make sure sitemap.xml is uploaded
echo - Make sure manifest.json is uploaded
echo - Make sure favicon.ico is uploaded
echo.
echo ========================================
pause
