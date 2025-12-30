@echo off
REM Script para commit automático no Windows
REM Executa: auto-commit.bat "mensagem do commit"

if "%~1"=="" (
    REM Se não foi fornecida mensagem, usar mensagem padrão com timestamp
    for /f "tokens=1-3 delims=/ " %%a in ('date /t') do set mydate=%%a/%%b/%%c
    for /f "tokens=1-2 delims=: " %%a in ('time /t') do set mytime=%%a:%%b
    set "MENSAGEM=auto: atualizações %mydate% %mytime%"
) else (
    set "MENSAGEM=%~1"
)

echo 🔄 Iniciando commit automático...
echo 📝 Mensagem: %MENSAGEM%

REM Adicionar todas as mudanças
git add .

REM Verificar se há mudanças para commitar
git diff --staged --quiet
if %errorlevel% equ 0 (
    echo ✅ Nenhuma mudança para commitar
    exit /b 0
)

REM Fazer commit
git commit -m "%MENSAGEM%"

if %errorlevel% equ 0 (
    echo ✅ Commit realizado com sucesso
    
    REM Fazer push
    echo 🚀 Enviando para o GitHub...
    git push
    
    if %errorlevel% equ 0 (
        echo ✅ Push realizado com sucesso!
        echo 🎉 Todas as mudanças foram enviadas para o GitHub
    ) else (
        echo ❌ Erro ao fazer push
        exit /b 1
    )
) else (
    echo ❌ Erro ao fazer commit
    exit /b 1
)