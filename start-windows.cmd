@echo off
chcp 65001 >nul
setlocal
cd /d "%~dp0"

echo ============================================
echo   Vip-service — локальный запуск
echo ============================================
echo.

where node >nul 2>nul
if errorlevel 1 goto err_node

for /f "delims=" %%v in ('node -v') do echo Node.js: %%v
echo.

if not exist ".env" call :make_env

if not exist "node_modules" goto install_deps
echo Зависимости уже установлены — пропускаю.
goto check_build

:install_deps
echo Устанавливаю зависимости — это 1–3 минуты...
call npm ci
if errorlevel 1 goto install_fallback
goto check_build

:install_fallback
echo.
echo npm ci не сработал, пробую npm install...
call npm install
if errorlevel 1 goto err_deps

:check_build
if exist ".next\BUILD_ID" goto run
echo.
echo Собираю сайт — это 30–60 секунд...
call npm run build
if errorlevel 1 goto err_build

:run
echo.
echo Запускаю сайт в отдельном окне.
echo Когда появится "Ready", откройте http://localhost:3000
echo Чтобы остановить сайт — закройте окно "Vip-service server".
echo.
start "Vip-service server" cmd /k "npm start"
timeout /t 8 /nobreak >nul
start "" http://localhost:3000
endlocal
exit /b 0

:make_env
echo Создаю .env из .env.example
copy ".env.example" ".env" >nul
exit /b 0

:err_node
echo [ошибка] Node.js не найден.
echo Установите Node.js 20.9 или новее: https://nodejs.org
echo После установки закройте это окно и запустите файл снова.
echo.
pause
exit /b 1

:err_deps
echo.
echo [ошибка] Не удалось установить зависимости.
echo Частая причина на Windows — нет средств сборки для better-sqlite3.
echo Поставьте Node.js LTS 22 или "Visual Studio Build Tools"
echo с компонентом "Desktop development with C++", затем запустите снова.
echo.
pause
exit /b 1

:err_build
echo.
echo [ошибка] Сборка не удалась. Текст ошибки — выше.
echo.
pause
exit /b 1
