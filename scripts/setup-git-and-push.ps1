# ALL MAX MIND - Git Setup & Push Script
# Script PowerShell para automatizar inicialização do Git e push para GitHub
#
# Uso: .\scripts\setup-git-and-push.ps1

param(
    [string]$GitHubOrg = "AllMaxMind",
    [string]$RepoName = "all-max-mind",
    [switch]$SkipPush = $false
)

# Cores para output
$SUCCESS = "Green"
$ERROR = "Red"
$INFO = "Cyan"
$WARNING = "Yellow"

Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor $INFO
Write-Host "║     ALL MAX MIND - Git Setup & Push Script               ║" -ForegroundColor $INFO
Write-Host "╚════════════════════════════════════════════════════════════╝`n" -ForegroundColor $INFO

# Verificar se estamos no diretório correto
if (-not (Test-Path "package.json")) {
    Write-Host "❌ Erro: package.json não encontrado!" -ForegroundColor $ERROR
    Write-Host "Execute este script na raiz do projeto" -ForegroundColor $ERROR
    exit 1
}

# Passo 1: Verificar Git instalado
Write-Host "[1/7] Verificando Git instalado..." -ForegroundColor $INFO
$gitVersion = git --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Git não está instalado!" -ForegroundColor $ERROR
    exit 1
}
Write-Host "✅ Git instalado: $gitVersion" -ForegroundColor $SUCCESS

# Passo 2: Verificar GitHub CLI
Write-Host "`n[2/7] Verificando GitHub CLI..." -ForegroundColor $INFO
$ghVersion = gh --version 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "⚠️  GitHub CLI não está instalado" -ForegroundColor $WARNING
    Write-Host "   Para automatizar, instale: https://cli.github.com/" -ForegroundColor $WARNING
} else {
    Write-Host "✅ GitHub CLI instalado: $ghVersion" -ForegroundColor $SUCCESS
}

# Passo 3: Inicializar Git (se necessário)
Write-Host "`n[3/7] Inicializando Git..." -ForegroundColor $INFO
if (Test-Path ".git") {
    Write-Host "✓ Repositório Git já existe" -ForegroundColor $SUCCESS
} else {
    git init
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Git repository inicializado" -ForegroundColor $SUCCESS
    } else {
        Write-Host "❌ Erro ao inicializar Git" -ForegroundColor $ERROR
        exit 1
    }
}

# Passo 4: Configurar Git user
Write-Host "`n[4/7] Configurando Git user..." -ForegroundColor $INFO
git config user.name "All Max Mind DevOps"
git config user.email "devops@allmaxmind.com"
$userName = git config user.name
Write-Host "✅ Configurado: $userName" -ForegroundColor $SUCCESS

# Passo 5: Criar .gitignore (se necessário)
Write-Host "`n[5/7] Verificando .gitignore..." -ForegroundColor $INFO
if (Test-Path ".gitignore") {
    Write-Host "✓ .gitignore já existe" -ForegroundColor $SUCCESS
} else {
    Write-Host "Criando .gitignore..." -ForegroundColor $INFO
    $gitignoreContent = @"
# Dependencies
node_modules/
.pnp
.pnp.js

# Testing
coverage/

# Production
dist/
build/

# Environment
.env
.env.local
.env.*.local

# Misc
.DS_Store
*.log
npm-debug.log*

# IDE
.vscode/
.idea/
*.swp
*.swo

# OS
Thumbs.db

# Vercel
.vercel/

# Build
.next/
out/

# AIOS
node_modules/
dist/
build/
"@
    Set-Content -Path ".gitignore" -Value $gitignoreContent
    Write-Host "✅ .gitignore criado" -ForegroundColor $SUCCESS
}

# Passo 6: Fazer commit inicial
Write-Host "`n[6/7] Fazendo commit inicial..." -ForegroundColor $INFO
git add .
$status = git status --short
if ([string]::IsNullOrEmpty($status)) {
    Write-Host "✓ Nada para commitar (repositório limpo)" -ForegroundColor $SUCCESS
} else {
    Write-Host "Arquivos para commitar:" -ForegroundColor $INFO
    Write-Host $status -ForegroundColor $INFO

    git commit -m "chore: initial commit - ALL MAX MIND v1.0.0

- React 19 + TypeScript + Vite frontend
- Vercel serverless + Supabase PostgreSQL backend
- Google Gemini AI integration
- Sentry error monitoring
- Multi-phase problem-solving platform
- Complete DevOps pipelines

Co-Authored-By: Gage (DevOps) <devops@company.com>"

    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Commit inicial criado" -ForegroundColor $SUCCESS
    } else {
        Write-Host "❌ Erro ao criar commit" -ForegroundColor $ERROR
        exit 1
    }
}

# Passo 7: Fazer push (opcional)
if (-not $SkipPush) {
    Write-Host "`n[7/7] Fazendo push para GitHub..." -ForegroundColor $INFO

    # Verificar se remoto existe
    $remoteUrl = git remote get-url origin 2>&1
    if ([string]::IsNullOrEmpty($remoteUrl) -or $LASTEXITCODE -ne 0) {
        Write-Host "`nRepositório remoto não configurado!" -ForegroundColor $WARNING
        Write-Host "Para fazer push automaticamente, execute:" -ForegroundColor $INFO
        Write-Host "  gh repo create $RepoName --public --source=. --remote=origin --push" -ForegroundColor $INFO
        Write-Host "`nOu configure manualmente:" -ForegroundColor $INFO
        Write-Host "  git remote add origin https://github.com/$GitHubOrg/$RepoName.git" -ForegroundColor $INFO
        Write-Host "  git branch -M main" -ForegroundColor $INFO
        Write-Host "  git push -u origin main" -ForegroundColor $INFO
    } else {
        Write-Host "Remote URL: $remoteUrl" -ForegroundColor $INFO
        git push -u origin main 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "✅ Push para GitHub bem-sucedido!" -ForegroundColor $SUCCESS
        } else {
            Write-Host "⚠️  Erro durante push (verifique autenticação GitHub)" -ForegroundColor $WARNING
        }
    }
}

# Resumo final
Write-Host "`n╔════════════════════════════════════════════════════════════╗" -ForegroundColor $SUCCESS
Write-Host "║              ✅ SETUP GIT COMPLETADO                     ║" -ForegroundColor $SUCCESS
Write-Host "╚════════════════════════════════════════════════════════════╝" -ForegroundColor $SUCCESS

Write-Host "`nPróximos passos:" -ForegroundColor $INFO
Write-Host "1. Configure suas chaves de API em .env.local" -ForegroundColor $INFO
Write-Host "2. Adicione GitHub secrets: gh secret create KEY_NAME --body 'value'" -ForegroundColor $INFO
Write-Host "3. Instale pre-push hooks: cp scripts/pre-push-hook.sh .git/hooks/pre-push" -ForegroundColor $INFO
Write-Host "4. Teste a aplicação: npm run dev" -ForegroundColor $INFO

Write-Host "`nReferência:" -ForegroundColor $INFO
Write-Host "Docs: docs/SETUP_SECRETS_TEMPLATE.md" -ForegroundColor $INFO
Write-Host "Plan: docs/DEVOPS_ACTION_PLAN.md" -ForegroundColor $INFO

Write-Host "`nGit Status:" -ForegroundColor $INFO
git log --oneline -5

Write-Host "`n"
