# ALL MAX MIND - Setup Secrets & Integration Template

**Documento:** Template passo-a-passo para configurar todas as integrações
**Status:** Siga cada seção na ordem
**Tempo estimado:** 1-2 horas total
**Objetivo:** Sistema completamente funcional e integrado

---

## 🔧 PRÉ-REQUISITOS

Antes de começar, certifique-se de ter:

- [ ] Node.js 18+ instalado (`node --version`)
- [ ] npm instalado (`npm --version`)
- [ ] Git instalado (`git --version`)
- [ ] GitHub CLI instalado (`gh --version`) ou GitHub account
- [ ] Acesso ao terminal (PowerShell ou CMD)

**Instalar GitHub CLI (se necessário):**
```bash
# Windows - via Winget
winget install GitHub.cli

# Ou download: https://cli.github.com/
```

---

## SEÇÃO 1: SUPABASE SETUP

### Passo 1.1: Criar Projeto Supabase

1. Acesse: https://app.supabase.com
2. Clique: "New Project"
3. Preencha:
   ```
   Project Name: all-max-mind
   Database Password: [gere uma senha forte]
   Region: South America (São Paulo)
   ```
4. Clique: "Create new project"
5. Aguarde criação (~2 minutos)

### Passo 1.2: Obter Credenciais Supabase

Após criação:

1. Vá para: Project Settings → API
2. Copie e guarde essas informações:

```
┌─ SUPABASE CREDENTIALS ─────────────────────────────────┐
│                                                         │
│ Project URL:                                           │
│ VITE_SUPABASE_URL = https://[project-id].supabase.co   │
│                                                         │
│ Anon Key (público, seguro no frontend):               │
│ VITE_SUPABASE_ANON_KEY = eyJ...                        │
│                                                         │
│ Service Role Key (privado, NUNCA expor):              │
│ SUPABASE_SERVICE_ROLE_KEY = eyJ...                     │
│                                                         │
└─────────────────────────────────────────────────────────┘
```

**Salve em local seguro (notepad, 1Password, etc)**

### Passo 1.3: Criar Schema do Banco

1. Vá para: SQL Editor
2. Copie e cole todo o conteúdo de:
   ```
   C:\Users\adria\codes\All_Max_Mind_System\supabase\schema.sql
   ```
3. Clique: "Run"
4. Aguarde execução

**Verificar:**
```sql
-- No SQL Editor, execute:
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Deve retornar:
-- dimensions
-- leads
-- problems
-- questions_answers
```

### Passo 1.4: Aplicar Security Hardening

1. Vá para: SQL Editor
2. Copie e cole todo o conteúdo de:
   ```
   C:\Users\adria\codes\All_Max_Mind_System\supabase\security-hardening.sql
   ```
3. Clique: "Run"
4. Aguarde execução

**Verificar RLS está ativado:**
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename IN ('problems', 'dimensions', 'questions_answers', 'leads')
AND schemaname = 'public'
ORDER BY tablename;

-- Deve retornar 4 linhas, todas com rowsecurity = true
```

### Passo 1.5: Testar Conexão Supabase

1. Abra terminal na pasta do projeto:
   ```bash
   cd C:\Users\adria\codes\All_Max_Mind_System
   ```

2. Crie arquivo `.env.local`:
   ```bash
   # Windows PowerShell
   $content = @"
VITE_SUPABASE_URL=https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-anon-key]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
"@
   Set-Content -Path .env.local -Value $content
   ```

3. Teste conexão:
   ```bash
   npm run dev
   # Deve iniciar em http://localhost:3000 sem erros
   ```

---

## SEÇÃO 2: GOOGLE GEMINI API SETUP

### Passo 2.1: Criar Google Cloud Project

1. Acesse: https://console.cloud.google.com
2. Clique: "Select a Project" → "NEW PROJECT"
3. Preencha:
   ```
   Project Name: all-max-mind
   Organization: [sua organização ou deixe vazio]
   ```
4. Clique: "CREATE"
5. Aguarde criação

### Passo 2.2: Habilitar Gemini API

1. Vá para: "APIs & Services" → "Library"
2. Pesquise: "Generative Language API"
3. Clique no resultado
4. Clique: "ENABLE"
5. Aguarde habilitação

### Passo 2.3: Criar API Key

1. Vá para: "APIs & Services" → "Credentials"
2. Clique: "CREATE CREDENTIALS" → "API Key"
3. Uma janela aparecerá com sua chave
4. Copie e guarde:

```
┌─ GEMINI API KEY ───────────────────────────┐
│                                            │
│ VITE_GEMINI_API_KEY = AIzaSy...           │
│                                            │
└────────────────────────────────────────────┘
```

### Passo 2.4: Configurar Restrições de API Key

1. Clique no ícone de lápis (edit) da chave criada
2. Em "API restrictions":
   - Selecione: "Restrict key"
   - Pesquise: "Generative Language API"
   - Selecione: "Generative Language API"
3. Em "Application restrictions":
   - Selecione: "HTTP referrers (web sites)"
   - Adicione:
     ```
     localhost:*
     *.vercel.app
     seu-dominio.com (se tiver)
     ```
4. Clique: "SAVE"

### Passo 2.5: Testar Gemini API

```bash
# No terminal, teste:
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=YOUR_API_KEY \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"Hello"}]}]}'

# Deve retornar JSON com resposta
```

---

## SEÇÃO 3: SENTRY ERROR MONITORING SETUP

### Passo 3.1: Criar Conta Sentry

1. Acesse: https://sentry.io/auth/register/
2. Clique: "Sign up with GitHub"
3. Autorize acesso
4. Complete o onboarding

### Passo 3.2: Criar Projeto Sentry

1. Clique: "Create Project"
2. Preencha:
   ```
   Platform: React
   Project Name: all-max-mind
   Organization: [seu org]
   ```
3. Clique: "Create Project"
4. Você será levado para instruções de integração

### Passo 3.3: Obter DSN

Na página de configuração:

1. Copie a linha com o DSN:
   ```
   ┌─ SENTRY DSN ────────────────────────────────┐
   │                                             │
   │ SENTRY_DSN = https://[key]@sentry.io/[id]  │
   │                                             │
   └─────────────────────────────────────────────┘
   ```

### Passo 3.4: Configurar Alertas (Opcional)

1. Vá para: Project Settings → Alerts
2. Clique: "Create Alert"
3. Configure:
   - "When": Error rate > 5%
   - "Then": Send email & Slack notification (se conectado)
4. Salve

---

## SEÇÃO 4: VERCEL DEPLOYMENT SETUP

### Passo 4.1: Criar Conta Vercel

1. Acesse: https://vercel.com/signup
2. Clique: "Continue with GitHub"
3. Autorize acesso
4. Complete onboarding

### Passo 4.2: Criar Projeto Vercel

**Opção A: Via GitHub (Recomendado)**

1. Vá para: https://vercel.com/new
2. Clique: "Import Git Repository"
3. Autorize GitHub se necessário
4. Selecione: `AllMaxMind/AllMaxMind_System`
5. Configure:
   ```
   Framework Preset: Other
   Build Command: npm run build
   Output Directory: dist
   Install Command: npm ci
   ```
6. Clique: "Deploy"

**Opção B: Via CLI**

```bash
npm install -g vercel
vercel login
cd C:\Users\adria\codes\All_Max_Mind_System
vercel link
```

### Passo 4.3: Obter Vercel Credentials

Você precisará de:

```
┌─ VERCEL CREDENTIALS ──────────────────────┐
│                                           │
│ VERCEL_TOKEN:                             │
│ https://vercel.com/account/tokens         │
│ → Create Token → Copy value               │
│                                           │
│ VERCEL_ORG_ID:                            │
│ https://vercel.com/account                │
│ → Procure por "Team ID"                   │
│                                           │
│ VERCEL_PROJECT_ID:                        │
│ https://vercel.com/[project]/settings     │
│ → Copie "Project ID"                      │
│                                           │
└───────────────────────────────────────────┘
```

### Passo 4.4: Adicionar Environment Variables em Vercel

1. Vá para: Project Settings → Environment Variables
2. Adicione cada variável (uma por uma):

```
VITE_SUPABASE_URL = https://[project-id].supabase.co
VITE_SUPABASE_ANON_KEY = [sua-anon-key]
VITE_GEMINI_API_KEY = [sua-gemini-api-key]
SENTRY_DSN = https://[key]@sentry.io/[id]
SUPABASE_SERVICE_ROLE_KEY = [sua-service-role-key]
```

3. Clique: "Save" para cada uma

---

## SEÇÃO 5: GITHUB SETUP & PUSH

### Passo 5.1: Autenticar GitHub

```bash
# Terminal
gh auth login

# Escolha as opções:
# → GitHub.com
# → HTTPS
# → Y (authenticate Git with GitHub credentials)
# → [siga o fluxo no navegador]
```

### Passo 5.2: Inicializar Git Localmente

```bash
cd C:\Users\adria\codes\All_Max_Mind_System

# Verificar se já tem git
git status
# Se der erro "not a git repository", continue:

# Inicializar
git init

# Configurar identidade
git config user.name "DevOps"
git config user.email "devops@allmaxmind.com"

# Verificar
git config --list
```

### Passo 5.3: Criar .gitignore (se não existir)

```bash
# Windows PowerShell
$gitignore = @"
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
"@
Set-Content -Path .gitignore -Value $gitignore
```

### Passo 5.4: Fazer Primeiro Commit

```bash
# Adicionar todos os arquivos
git add .

# Verificar o que será commitado
git status

# Fazer commit inicial
git commit -m "chore: initial commit - ALL MAX MIND v1.0.0

- React 19 + TypeScript + Vite frontend
- Vercel serverless + Supabase PostgreSQL backend
- Google Gemini AI integration
- Sentry error monitoring
- Multi-phase problem-solving platform
- DevOps pipelines configured

Co-Authored-By: Gage (DevOps) <devops@company.com>"
```

### Passo 5.5: Criar Repositório GitHub

```bash
# Criar repositório remoto
gh repo create all-max-mind \
  --public \
  --description "AI-powered cognitive blueprint platform" \
  --source=. \
  --remote=origin \
  --push

# Aguarde o push completar (~1-2 minutos)
```

**Verificar:**
```bash
git remote -v
# Deve mostrar:
# origin  https://github.com/AllMaxMind/all-max-mind.git (fetch)
# origin  https://github.com/AllMaxMind/all-max-mind.git (push)
```

### Passo 5.6: Adicionar GitHub Secrets

```bash
# GitHub Actions secrets (para CI/CD)
gh secret create VERCEL_TOKEN --body "seu-vercel-token"
gh secret create VERCEL_ORG_ID --body "seu-org-id"
gh secret create VERCEL_PROJECT_ID --body "seu-project-id"
gh secret create SLACK_WEBHOOK --body "seu-slack-webhook" # opcional

# Verificar
gh secret list
```

### Passo 5.7: Configurar Branch Protection

```bash
# Proteger branch main
gh api repos/:owner/:repo/branches/main/protection \
  -X PUT \
  -f required_status_checks='{"strict":true,"contexts":["ci.yml"]}' \
  -f enforce_admins=true \
  -f required_pull_request_reviews='{"required_approving_review_count":1}'
```

---

## SEÇÃO 6: TESTAR INTEGRAÇÕES LOCALMENTE

### Teste 6.1: Verificar Variáveis de Ambiente

```bash
# Windows PowerShell
Get-Content .env.local

# Deve mostrar:
# VITE_SUPABASE_URL=https://...
# VITE_SUPABASE_ANON_KEY=...
# VITE_GEMINI_API_KEY=...
```

### Teste 6.2: Instalar Dependências

```bash
npm install
```

### Teste 6.3: Executar Type Check

```bash
npm run typecheck
# Deve passar sem erros
```

### Teste 6.4: Executar Linter

```bash
npm run lint
# Deve passar sem erros
```

### Teste 6.5: Executar Testes

```bash
npm test
# Deve passar todos os testes
```

### Teste 6.6: Build de Produção

```bash
npm run build
# Deve criar pasta dist/ sem erros
```

### Teste 6.7: Iniciar Desenvolvimento

```bash
npm run dev
# Acesse: http://localhost:3000
# Aplicação deve carregar sem erros no console
```

---

## SEÇÃO 7: CHECKLIST FINAL DE INTEGRAÇÃO

### Supabase ✅
- [ ] Projeto criado em https://app.supabase.com
- [ ] Schema importado com sucesso
- [ ] RLS policies aplicadas
- [ ] Credenciais guardadas com segurança
- [ ] Conexão local testada

### Google Gemini ✅
- [ ] API Key gerada
- [ ] Restrições configuradas
- [ ] Teste via curl bem-sucedido
- [ ] Chave adicionada ao .env.local

### Sentry ✅
- [ ] Projeto criado em https://sentry.io
- [ ] DSN obtido
- [ ] Alertas configurados (opcional)

### Vercel ✅
- [ ] Projeto criado
- [ ] Environment variables adicionadas
- [ ] Build bem-sucedido

### GitHub ✅
- [ ] Repositório criado
- [ ] Código feito push
- [ ] Branch protection configurado
- [ ] Secrets adicionados
- [ ] Actions workflows rodando

### Local Development ✅
- [ ] `.env.local` configurado
- [ ] `npm install` executado
- [ ] `npm run typecheck` passou
- [ ] `npm run lint` passou
- [ ] `npm test` passou
- [ ] `npm run build` passou
- [ ] `npm run dev` funcionando

---

## PRÓXIMOS PASSOS

### Imediatamente Após Setup:

1. **Instalar Pre-Push Hooks:**
   ```bash
   cp scripts/pre-push-hook.sh .git/hooks/pre-push
   chmod +x .git/hooks/pre-push
   ```

2. **Fazer Teste de Push:**
   ```bash
   echo "# Test" >> TEST.md
   git add TEST.md
   git commit -m "test: verify hooks"
   git push
   # Deve rodar todas as verificações
   ```

3. **Monitorar Primeira Deploy:**
   - Acesse: https://vercel.com/all-max-mind
   - Aguarde build completar
   - Verifique logs por erros

4. **Testar Aplicação em Staging:**
   ```bash
   # Usar URL de preview do Vercel
   https://all-max-mind-[hash].vercel.app
   ```

---

## TROUBLESHOOTING

### Problema: "VITE_SUPABASE_URL is not defined"
**Solução:**
```bash
# Verificar .env.local
cat .env.local
# Se vazio, adicione as variáveis manualmente
```

### Problema: "Cannot connect to Supabase"
**Solução:**
```bash
# Testar URL
curl https://[seu-project].supabase.co/rest/v1/
# Deve retornar JSON, não erro
```

### Problema: "Gemini API returns 401"
**Solução:**
```bash
# Verificar chave
echo $env:VITE_GEMINI_API_KEY
# Chave não pode estar entre aspas
```

### Problema: "git push" falha
**Solução:**
```bash
# Verificar autenticação
gh auth status
# Se "Not authenticated", faça:
gh auth login
```

### Problema: GitHub Actions falham
**Solução:**
```bash
# Verificar secrets foram adicionados
gh secret list
# Deve mostrar todos os secrets criados
```

---

## VERIFICAÇÃO FINAL

Após completar todos os passos, você deve ter:

✅ **Supabase:**
- Banco de dados funcionando
- RLS policies ativas
- Schema criado
- Conexão testada

✅ **Google Gemini:**
- API key válida
- Restrições configuradas
- Teste de API bem-sucedido

✅ **Vercel:**
- Projeto criado
- Environment variables configuradas
- Auto-deploy ativado

✅ **GitHub:**
- Repositório criado
- Código feito push
- Actions rodando
- Secrets armazenados

✅ **Local Development:**
- Aplicação rodando em localhost:3000
- Sem erros de tipo
- Todos os testes passando
- Build de produção funcionando

---

## 🎉 SUCESSO!

Se todas as verificações passaram, seu sistema está:

✅ Funcionando localmente
✅ Integrado com Supabase
✅ Conectado ao Gemini API
✅ Pronto para deploy no Vercel
✅ Com DevOps pipelines configurados

**Próximo passo:** Executar o deployment para produção
**Referência:** Ver `DEVOPS_ACTION_PLAN.md` para fases finais

---

**Documento:** SETUP_SECRETS_TEMPLATE.md
**Status:** Template pronto para seguir manualmente
**Tempo total:** 1-2 horas
**Resultado esperado:** Sistema completamente funcional e integrado
