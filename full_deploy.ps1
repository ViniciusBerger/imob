# Script de Deploy Completo (Upload + Build + Push)
# Roda tudo do seu VS Code, usando a força da VPS.

$vpsUser = Read-Host "Usuário VPS (ex: root)"
$vpsIp = Read-Host "IP da VPS"
$vpsPort = Read-Host "Porta SSH (padrão 22)"
if (-not $vpsPort) { $vpsPort = "22" }

$dockerUser = Read-Host "Seu Usuário Docker Hub"
# Usa a pasta home do usuário (~/pms) para evitar erro de permissão (Permission Denied)
$remotePath = "~/pms"

Write-Host "`n1. --- ENVIANDO ARQUIVOS (SCP) ---"
# Removido .env.example porque ele não existe localmente e causava erro
# Limpa pastas antigas para garantir atualização sem cache/permissão
Write-Host "Limpar pastas antigas na VPS..."
ssh -p $vpsPort "${vpsUser}@${vpsIp}" "rm -rf ${remotePath}/backend ${remotePath}/frontend"

scp -P $vpsPort -r .\backend .\frontend .\docker-compose.prod.yml .\Dockerfile .\docker-compose.yml "${vpsUser}@${vpsIp}:${remotePath}"

Write-Host "`n2. --- CONSTRUINDO E ENVIANDO IMAGEM (SSH -> Docker Hub) ---"
# Adicionado 'sudo' e flag '-t' no SSH para permitir rodar como root (pede senha se precisar)
$buildCmd = "cd $remotePath && sudo docker build --no-cache -t ${dockerUser}/pms-unified:latest . && sudo docker push ${dockerUser}/pms-unified:latest"

# ssh -t força alocação de terminal para o sudo funcionar
ssh -t -p $vpsPort "${vpsUser}@${vpsIp}" $buildCmd

Write-Host "`n-----------------------------------------------------------"
Write-Host "CONCLUSÃO:"
Write-Host "1. Arquivos atualizados na VPS."
Write-Host "2. Imagem '${dockerUser}/pms-unified' atualizada no Docker Hub."
Write-Host "3. AGORA: Vá no Portainer e clique em 'Update Stack' (com Re-pull)."
Write-Host "-----------------------------------------------------------"
Pause
