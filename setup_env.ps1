Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "   CONFIGURAÇÃO DE AMBIENTE DE DESENVOLVIMENTO" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Função para verificar e instalar
function Check-And-Install ($name, $id, $command) {
    if (Get-Command $command -ErrorAction SilentlyContinue) {
        Write-Host "✅ $name já está instalado." -ForegroundColor Green
    }
    else {
        Write-Host "⚠️ $name não encontrado. Iniciando instalação via Winget..." -ForegroundColor Yellow
        Write-Host "   (Uma janela ou prompt de confirmação pode aparecer. Aceite se solicitado)" -ForegroundColor Gray
        
        # Tenta instalar. "-i" mode interactive para garantir que o usuário veja erros se houver
        winget install --id $id -e --source winget --accept-source-agreements --accept-package-agreements
        
        if ($?) {
            Write-Host "✅ $name instalado! (Pode ser necessário reiniciar o terminal)" -ForegroundColor Green
        }
        else {
            Write-Host "❌ Falha ao instalar $name. Tente rodar este script como Administrador." -ForegroundColor Red
        }
    }
}

# 1. Node.js (Essencial para npm/npx)
Check-And-Install "Node.js LTS" "OpenJS.NodeJS.LTS" "node"

# 2. Git (Essencial para controle de versão)
Check-And-Install "Git" "Git.Git" "git"

# 3. Docker (Apenas verificação)
if (Get-Command docker -ErrorAction SilentlyContinue) {
    Write-Host "✅ Docker CLI está disponível." -ForegroundColor Green
}
else {
    Write-Host "⚠️ Docker não detectado no PATH." -ForegroundColor Yellow
    Write-Host "   Se você usa Docker Desktop, verifique se ele está rodando."
    Write-Host "   Para deploy remoto na VPS, isso não é bloqueante." -ForegroundColor Gray
}

Write-Host ""
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CONCLUSÃO:" -ForegroundColor Cyan
Write-Host "1. Se houve instalações, FECHE e REABRA este terminal."
Write-Host "2. Depois, tente rodar 'npm install' novamente."
Write-Host "==========================================" -ForegroundColor Cyan
Pause
