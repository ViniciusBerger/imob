# Script de Upload para VPS
# Execute este script no PowerShell do seu Windows (não na VPS)

$vpsUser = Read-Host "Digite o Usuário da VPS (ex: root)"
$vpsIp = Read-Host "Digite o IP da VPS"
$remotePath = "~/real-estate-pms"

$vpsPort = Read-Host "Digite a Porta SSH (padrão 22)"
if (-not $vpsPort) { $vpsPort = "22" }

Write-Host "`n1. Criando pasta remota em $remotePath..."
ssh -p $vpsPort "$vpsUser@$vpsIp" "mkdir -p $remotePath"

Write-Host "`n2. Enviando arquivos..."
# Nota: scp usa -P (maiúsculo) para porta
scp -P $vpsPort -r .\backend .\frontend .\docker-compose.yml .\.env.example "${vpsUser}@${vpsIp}:${remotePath}"

Write-Host "`n----------------------------------------------"
Write-Host "SUCESSO! Arquivos enviados."
Write-Host "----------------------------------------------"
Write-Host "Agora, volte para o seu terminal SSH da VPS e rode:"
Write-Host "cd $remotePath"
Write-Host "cp .env.example .env  # (Edite se necessário)"
Write-Host "docker-compose up -d --build"
Write-Host "----------------------------------------------"
Pause
