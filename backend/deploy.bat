@echo off
echo ========================================
echo Nakama Network API - Quick Deploy
echo ========================================
echo.

REM Check if git is initialized
if not exist .git (
    echo Initializing git repository...
    git init
    git add .
    git commit -m "Initial commit - Nakama Network API"
)

REM Check if remote exists
git remote | findstr origin >nul
if errorlevel 1 (
    echo.
    echo WARNING: No git remote found!
    echo Please create a GitHub repository and run:
    echo git remote add origin https://github.com/yourusername/nakama-network.git
    echo git push -u origin main
    pause
    exit /b 1
)

echo Git repository ready
echo.
echo Next steps:
echo 1. Push to GitHub: git push origin main
echo 2. Go to https://render.com
echo 3. Click 'New +' - 'Web Service'
echo 4. Connect your GitHub repository
echo 5. Configure:
echo    - Root Directory: backend
echo    - Build Command: pip install -r requirements.txt
echo    - Start Command: uvicorn app.main:app --host 0.0.0.0 --port $PORT
echo 6. Add environment variables:
echo    - DEBUG=false
echo    - GEMINI_API_KEY=your_key
echo    - CORS_ORIGINS=https://your-frontend.vercel.app
echo.
echo Your API will be live in ~5 minutes!
echo.
pause
