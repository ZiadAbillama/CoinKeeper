@echo off
REM Jenkins Setup Script for CoinKeeper (Windows PowerShell)
REM This script automates Jenkins setup and initialization

setlocal enabledelayedexpansion

echo ================================================
echo CoinKeeper Jenkins Setup Script
echo ================================================
echo.

REM Check prerequisites
echo Checking prerequisites...

where docker >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker is not installed
    exit /b 1
)
echo [OK] Docker is installed

where docker-compose >nul 2>nul
if %errorlevel% neq 0 (
    echo Docker Compose is not installed
    exit /b 1
)
echo [OK] Docker Compose is installed

REM Create jenkins directory if needed
echo.
echo Setting up directories...
if not exist "jenkins" (
    mkdir jenkins
    echo [OK] Created jenkins directory
) else (
    echo [OK] Jenkins directory exists
)

REM Check docker-compose.yml
if not exist "jenkins\docker-compose.yml" (
    echo [ERROR] jenkins\docker-compose.yml not found
    exit /b 1
)
echo [OK] Docker Compose file found

REM Create environment file
echo.
echo Setting up environment variables...
if not exist "jenkins\.env" (
    echo [OK] Create jenkins\.env with your credentials
) else (
    echo [OK] .env file already exists
)

REM Build Jenkins image
echo.
echo Building Jenkins Docker image...
cd jenkins
call docker-compose build

if %errorlevel% neq 0 (
    echo Failed to build Jenkins image
    exit /b 1
)
echo [OK] Jenkins image built successfully

REM Start Jenkins
echo.
echo Starting Jenkins containers...
call docker-compose up -d

if %errorlevel% neq 0 (
    echo Failed to start Jenkins
    exit /b 1
)
echo [OK] Jenkins started successfully

REM Display next steps
echo.
echo ================================================
echo Setup Complete!
echo ================================================
echo.
echo Next Steps:
echo 1. Open Jenkins: http://localhost:8080/jenkins
echo 2. Retrieve initial password:
echo    docker-compose -f jenkins\docker-compose.yml logs jenkins ^| findstr initialAdminPassword
echo 3. Complete the Jenkins setup wizard
echo 4. Configure credentials
echo 5. Create Pipeline jobs
echo.
echo Useful Commands:
echo Stop Jenkins:     cd jenkins ^&^& docker-compose down
echo View logs:        cd jenkins ^&^& docker-compose logs -f jenkins
echo Restart Jenkins:  cd jenkins ^&^& docker-compose restart
echo.

cd ..
