@echo off
setlocal enabledelayedexpansion

:: 获取 ESC 字符 (ASCII 27)
for /F %%a in ('echo prompt $E ^| cmd') do set "ESC=%%a"

:: 样式定义
set "RESET=!ESC![0m"
set "BOLD=!ESC![1m"

echo %BOLD%ANSI Color Test for xterm%RESET%
echo.

:: ========== 256 色前景色表 ==========
echo %BOLD%=== 256 Colors (Foreground, 38;5) ===%RESET%
echo.
for /l %%i in (0,1,255) do (
    set "color=%%i"
    <nul set /p="!ESC![38;5;!color!m !color! !RESET!"
    set /a "mod=%%i %% 16"
    if !mod!==15 echo.
)

echo.
:: ========== 256 色背景色表 ==========
echo %BOLD%=== 256 Colors (Background, 48;5) ===%RESET%
echo.
for /l %%i in (0,1,255) do (
    set "color=%%i"
    <nul set /p="!ESC![48;5;!color!m !color! !RESET!"
    set /a "mod=%%i %% 16"
    if !mod!==15 echo.
)

echo.
echo.

:: ========== 标准 16 色（前景/背景） ==========
echo %BOLD%=== Standard 16 Colors (4-bit) ===%RESET%
echo.
echo Foreground (30-37, 90-97):
set "fg_codes=30 31 32 33 34 35 36 37 90 91 92 93 94 95 96 97"
for %%c in (%fg_codes%) do (
    set "code=%%c"
    <nul set /p="!ESC![!code!m  !code!  !RESET!"
)
echo.
echo.
echo Background (40-47, 100-107):
set "bg_codes=40 41 42 43 44 45 46 47 100 101 102 103 104 105 106 107"
for %%c in (%bg_codes%) do (
    set "code=%%c"
    <nul set /p="!ESC![!code!m  !code!  !RESET!"
)


echo.
echo %BOLD%Test Completed.%RESET%

PAUSE