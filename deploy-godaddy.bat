@echo off
echo ========================================
echo    Royal Nano Ceramic - GoDaddy Deploy
echo ========================================
echo.

echo [1/5] Building production version...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [2/5] Copying deployment files...
if not exist "dist\royal-nano-ceramic" (
    echo ERROR: Build directory not found!
    pause
    exit /b 1
)

copy ".htaccess" "dist\royal-nano-ceramic\" >nul
copy "web.config" "dist\royal-nano-ceramic\" >nul
copy "_headers" "dist\royal-nano-ceramic\" >nul
copy "_redirects" "dist\royal-nano-ceramic\" >nul

echo.
echo [3/5] Verifying deployment files...
dir "dist\royal-nano-ceramic" | find "index.html" >nul
if %errorlevel% neq 0 (
    echo ERROR: index.html not found in build!
    pause
    exit /b 1
)

echo.
echo [4/5] Deployment files ready!
echo.
echo Files to upload to GoDaddy:
echo - All files from: dist\royal-nano-ceramic\
echo - Upload to: public_html (or your domain folder)
echo.
echo Important files included:
echo - .htaccess (for Apache servers)
echo - web.config (for Windows servers)
echo - _headers (for Netlify)
echo - _redirects (for Netlify)
echo.

echo [5/5] Opening deployment folder...
start "" "dist\royal-nano-ceramic"

echo.
echo ========================================
echo    Deployment Ready!
echo ========================================
echo.
echo Next steps:
echo 1. Upload all files from the opened folder to your GoDaddy hosting
echo 2. Make sure to upload .htaccess file (it's hidden by default)
echo 3. Test your website after upload
echo.
echo If you have issues:
echo - Check that .htaccess is uploaded
echo - Verify file permissions (644 for files, 755 for folders)
echo - Check GoDaddy error logs
echo.
pause


