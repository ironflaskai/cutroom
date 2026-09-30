@echo off
title Cutroom
cd /d "%~dp0"

where node >nul 2>nul
if errorlevel 1 (
  echo Node.js is required. Install from https://nodejs.org then try again.
  pause
  exit /b 1
)

if not exist "node_modules\" (
  echo Installing dependencies first...
  call npm install
  if errorlevel 1 (
    echo npm install failed.
    pause
    exit /b 1
  )
)

if not exist "out\main\index.js" (
  echo Building Cutroom...
  call npm run build
  if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
  )
)

echo Starting Cutroom...
call npx electron-vite preview
if errorlevel 1 (
  echo Launch failed. Trying dev mode...
  call npm run dev
)

if errorlevel 1 pause
