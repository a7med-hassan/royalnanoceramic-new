@echo off
echo ========================================
echo    Royal Nano Ceramic - Production Build
echo ========================================
echo.

echo [1/5] Cleaning previous build...
if exist "dist" rmdir /s /q "dist"
echo ✓ Previous build cleaned

echo.
echo [2/5] Installing dependencies...
call npm install
if %errorlevel% neq 0 (
    echo ERROR: Failed to install dependencies!
    pause
    exit /b 1
)
echo ✓ Dependencies installed

echo.
echo [3/5] Building production version...
call npm run build:prod
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Production build completed

echo.
echo [4/5] Copying deployment files...
if not exist "dist\royal-nano-ceramic" (
    echo ERROR: Build directory not found!
    pause
    exit /b 1
)

copy ".htaccess" "dist\royal-nano-ceramic\" >nul 2>&1
copy "web.config" "dist\royal-nano-ceramic\" >nul 2>&1
copy "_headers" "dist\royal-nano-ceramic\" >nul 2>&1
copy "_redirects" "dist\royal-nano-ceramic\" >nul 2>&1
copy "robots.txt" "dist\royal-nano-ceramic\" >nul 2>&1
copy "sitemap.xml" "dist\royal-nano-ceramic\" >nul 2>&1

echo ✓ Deployment files copied

echo.
echo [5/5] Verifying build...
dir "dist\royal-nano-ceramic" | find "index.html" >nul
if %errorlevel% neq 0 (
    echo ERROR: index.html not found in build!
    pause
    exit /b 1
)

dir "dist\royal-nano-ceramic" | find ".htaccess" >nul
if %errorlevel% neq 0 (
    echo WARNING: .htaccess not found in build!
)

echo ✓ Build verification completed

echo.
echo ========================================
echo    Build Completed Successfully!
echo ========================================
echo.
echo Build location: dist\royal-nano-ceramic\
echo.
echo Files included:
echo - All Angular build files
echo - .htaccess (Apache configuration)
echo - web.config (Windows Server configuration)
echo - _headers (Netlify headers)
echo - _redirects (Netlify redirects)
echo - robots.txt (SEO)
echo - sitemap.xml (SEO)
echo.
echo Ready for deployment to:
echo - GoDaddy (use .htaccess)
echo - Windows Server (use web.config)
echo - Netlify (use _headers and _redirects)
echo - Vercel (use vercel.json)
echo.
echo Next steps:
echo 1. Upload all files from dist\royal-nano-ceramic\ to your hosting
echo 2. Make sure .htaccess is uploaded (it's hidden by default)
echo 3. Test your website
echo.
pause
