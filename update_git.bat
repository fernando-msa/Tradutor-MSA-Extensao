@echo off
echo ==========================================
echo      Atualizador Git - Tradutor MSA
echo ==========================================
echo.
echo Adicionando arquivos...
git add .
echo.
set /p commitMsg="Digite a mensagem do commit (Enter para padrao): "
if "%commitMsg%"=="" set commitMsg="Atualizacao automatica via script"

echo Commitando com mensagem: "%commitMsg%"
git commit -m "%commitMsg%"

echo.
echo Enviando para o GitHub...
git push -u origin main

echo.
echo ==========================================
echoConcluido! Pressione qualquer tecla para sair.
pause >nul
