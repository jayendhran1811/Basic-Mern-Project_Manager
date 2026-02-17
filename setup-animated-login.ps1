# Automated Setup Script for Animated Login Page
# Run this script in PowerShell to create the new project

Write-Host "🎨 Animated Login Page Setup" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Create project directory
Write-Host "📁 Step 1: Creating project directory..." -ForegroundColor Yellow
$projectPath = "C:\Users\muthu\animated-login-app"

if (Test-Path $projectPath) {
    Write-Host "⚠️  Directory already exists. Please remove it first or choose a different name." -ForegroundColor Red
    exit
}

# Step 2: Create Next.js app
Write-Host "🚀 Step 2: Creating Next.js app with TypeScript and Tailwind..." -ForegroundColor Yellow
Write-Host "   (This will take a few minutes)" -ForegroundColor Gray

npx create-next-app@latest animated-login-app --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Failed to create Next.js app" -ForegroundColor Red
    exit
}

# Navigate to project
Set-Location $projectPath

# Step 3: Initialize shadcn/ui
Write-Host ""
Write-Host "🎨 Step 3: Initializing shadcn/ui..." -ForegroundColor Yellow
Write-Host "   Please select: Style=New York, Color=Slate, CSS Variables=Yes" -ForegroundColor Gray

npx shadcn@latest init -d

# Step 4: Add shadcn components
Write-Host ""
Write-Host "📦 Step 4: Installing shadcn components..." -ForegroundColor Yellow

npx shadcn@latest add button input label checkbox -y

# Step 5: Install additional dependencies
Write-Host ""
Write-Host "📦 Step 5: Installing additional dependencies..." -ForegroundColor Yellow

npm install lucide-react

# Step 6: Create directory structure
Write-Host ""
Write-Host "📁 Step 6: Creating directory structure..." -ForegroundColor Yellow

New-Item -ItemType Directory -Force -Path "src\app\login" | Out-Null
New-Item -ItemType Directory -Force -Path "src\app\signup" | Out-Null
New-Item -ItemType Directory -Force -Path "src\lib" | Out-Null

# Step 7: Create .env.local
Write-Host ""
Write-Host "⚙️  Step 7: Creating environment file..." -ForegroundColor Yellow

@"
NEXT_PUBLIC_API_URL=http://localhost:5000
"@ | Out-File -FilePath ".env.local" -Encoding UTF8

Write-Host ""
Write-Host "✅ Setup Complete!" -ForegroundColor Green
Write-Host ""
Write-Host "📝 Next Steps:" -ForegroundColor Cyan
Write-Host "1. Copy the animated login component to: src\components\ui\animated-characters-login-page.tsx" -ForegroundColor White
Write-Host "2. Copy the animated signup component to: src\components\ui\animated-characters-signup-page.tsx" -ForegroundColor White
Write-Host "3. Create login page at: src\app\login\page.tsx" -ForegroundColor White
Write-Host "4. Create signup page at: src\app\signup\page.tsx" -ForegroundColor White
Write-Host "5. Run: npm run dev" -ForegroundColor White
Write-Host ""
Write-Host "📖 See SHADCN_LOGIN_SETUP.md for detailed instructions" -ForegroundColor Gray
