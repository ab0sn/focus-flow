@echo off
title FocusFlow
cd /d "%~dp0"

:: Check if node_modules exists
if not exist "node_modules\" (
  echo [FocusFlow] Installing dependencies...
  npm install
  if errorlevel 1 (
    echo ERROR: npm install failed. Make sure Node.js is installed.
    pause
    exit /b 1
  )
)

echo [FocusFlow] Starting...
npm start
