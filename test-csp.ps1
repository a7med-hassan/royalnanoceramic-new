# PowerShell Script لاختبار إصلاح CSP
# Test CSP Fix - Royal Nano Ceramic

Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  اختبار إصلاح CSP" -ForegroundColor Yellow
Write-Host "  CSP Fix Verification" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# 1. التحقق من الملفات المحدثة
Write-Host "1️⃣  التحقق من الملفات المحدثة..." -ForegroundColor Green
Write-Host ""

$files = @(
    "src\index.html",
    "_headers",
    "vercel.json"
)

$domains = @(
    "stats.g.doubleclick.net",
    "*.doubleclick.net",
    "*.run.app",
    "*.conversionsapigateway.com"
)

$allFound = $true

foreach ($file in $files) {
    if (Test-Path $file) {
        Write-Host "   ✅ $file موجود" -ForegroundColor Green
        
        $content = Get-Content $file -Raw
        $fileOk = $true
        
        foreach ($domain in $domains) {
            $searchDomain = $domain -replace '\*', '*'
            if ($content -match [regex]::Escape($searchDomain)) {
                # Domain found
            } else {
                $fileOk = $false
                $allFound = $false
                Write-Host "      ❌ النطاق $domain غير موجود" -ForegroundColor Red
            }
        }
        
        if ($fileOk) {
            Write-Host "      ✅ جميع النطاقات موجودة" -ForegroundColor Green
        }
    } else {
        Write-Host "   ❌ $file غير موجود" -ForegroundColor Red
        $allFound = $false
    }
    Write-Host ""
}

# 2. بناء المشروع
Write-Host "2️⃣  بناء المشروع..." -ForegroundColor Green
Write-Host "   الأمر: npm run build" -ForegroundColor Gray
Write-Host ""

$buildChoice = Read-Host "   هل تريد بناء المشروع الآن؟ (y/n)"

if ($buildChoice -eq "y" -or $buildChoice -eq "Y") {
    Write-Host ""
    Write-Host "   جاري البناء..." -ForegroundColor Yellow
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "   ✅ تم البناء بنجاح!" -ForegroundColor Green
    } else {
        Write-Host ""
        Write-Host "   ❌ فشل البناء" -ForegroundColor Red
    }
} else {
    Write-Host "   ⏭️  تم تخطي البناء" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host "  الخلاصة" -ForegroundColor Yellow
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

if ($allFound) {
    Write-Host "✅ جميع التحديثات موجودة بشكل صحيح" -ForegroundColor Green
} else {
    Write-Host "❌ بعض التحديثات ناقصة" -ForegroundColor Red
}

Write-Host ""
Write-Host "الخطوات التالية:" -ForegroundColor Yellow
Write-Host "1. إذا لم تقم بالبناء، قم بتشغيل: npm run build" -ForegroundColor Gray
Write-Host "2. للنشر على Vercel، قم بتشغيل: vercel --prod" -ForegroundColor Gray
Write-Host "3. أو ادفع التغييرات إلى Git للنشر التلقائي" -ForegroundColor Gray
Write-Host ""
Write-Host "للتفاصيل الكاملة، راجع:" -ForegroundColor Yellow
Write-Host "   - CSP_FIX_REPORT.md (تقرير مفصل)" -ForegroundColor Gray
Write-Host "   - QUICK_START_CSP.md (دليل سريع)" -ForegroundColor Gray
Write-Host ""
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# انتظار لقراءة النتائج
Write-Host "اضغط أي مفتاح للخروج..." -ForegroundColor Cyan
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

