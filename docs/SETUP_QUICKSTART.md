# ALL MAX MIND - Setup Quickstart Guide

**Objetivo:** Configurar sistema completamente em 1-2 horas
**Status:** Guia passo-a-passo simplificado
**Target:** Desenvolvedores e DevOps leads

---

## ⚡ SETUP RÁPIDO EM 7 PASSOS

### PASSO 1: Supabase (15 minutos)

```bash
1. Acesse: https://app.supabase.com
2. Clique: "New Project"
3. Preencha:
   - Project Name: all-max-mind
   - Region: South America (São Paulo)
   - Password: [gere uma]
4. Aguarde criação (leva ~2 min)

5. Copie essas chaves (Settings → API):
   ✏️  VITE_SUPABASE_URL = https://[id].supabase.co
   ✏️  VITE_SUPABASE_ANON_KEY = eyJ...
   ✏️  SUPABASE_SERVICE_ROLE_KEY = eyJ...

6. SQL Editor → Cole conteúdo de:
   supabase/schema.sql
   supabase/security-hardening.sql
   → Execute ambos
```

✅ **Verificar:** No SQL Editor, execute:
```sql
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;
-- Deve retornar: dimensions, leads, problems, questions_answers
```

---

### PASSO 2: Google Gemini API (10 minutos)

```bash
1. Acesse: https://console.cloud.google.com
2. Novo Projeto → Nome: all-max-mind
3. APIs & Services → Library
4. Pesquise: "Generative Language API"
5. Clique: ENABLE

6. Credentials → Create Credentials → API Key
7. Copie:
   ✏️  VITE_GEMINI_API_KEY = AIzaSy...

8. Clique no ícone edit da chave
9. API restrictions → Selecione "Generative Language API"
10. Application restrictions → HTTP referrers
11. Adicione: localhost:*, *.vercel.app
12. Salve
```

✅ **Verificar:** No terminal:
```bash
curl -X POST https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=AIzaSy... \
  -H "Content-Type: application/json" \
  -d '{"contents":[{"parts":[{"text":"test"}]}]}'
```

---

### PASSO 3: Sentry (5 minutos - Opcional)

```bash
1. Acesse: https://sentry.io
2. Sign up with GitHub
3. Create Project → Platform: React
4. Copie o DSN:
   ✏️  SENTRY_DSN = https://[key]@sentry.io/[id]
```

---

### PASSO 4: Vercel (10 minutos)

```bash
1. Acesse: https://vercel.com/new
2. Import Git Repository → GitHub
3. Selecione: AllMaxMind/AllMaxMind_System
4. Clique: Deploy

5. Aguarde build completar
6. Project Settings → Environment Variables
7. Adicione cada variável:
   VITE_SUPABASE_URL
   VITE_SUPABASE_ANON_KEY
   VITE_GEMINI_API_KEY
   SENTRY_DSN
   SUPABASE_SERVICE_ROLE_KEY

OU via Vercel Token (avançado):
   vercel env add VITE_SUPABASE_URL
   vercel env add VITE_SUPABASE_ANON_KEY
   vercel env add VITE_GEMINI_API_KEY
```

Obtenha credenciais Vercel:
```
VERCEL_TOKEN: https://vercel.com/account/tokens → Create
VERCEL_ORG_ID: https://vercel.com/account → Team ID
VERCEL_PROJECT_ID: https://vercel.com/[project]/settings
```

---

### PASSO 5: GitHub Setup (20 minutos)

#### 5A: Autenticar GitHub CLI
```bash
gh auth login
# Escolha: GitHub.com → HTTPS → Y
# Completa no navegador
```

#### 5B: Inicializar Git Localmente
```bash
cd C:\Users\adria\codes\All_Max_Mind_System

git init
git config user.name "All Max Mind"
git config user.email "devops@allmaxmind.com"

# Criar .gitignore
cat > .gitignore << EOF
node_modules/
dist/
.env
.env.local
.vercel/
coverage/
.DS_Store
*.log
.idea/
.vscode/
EOF

# Ou use o script:
.\scripts\setup-git-and-push.ps1
```

#### 5C: Fazer Commit & Push
```bash
git add .
git commit -m "chore: initial commit - ALL MAX MIND v1.0.0"

# Criar repositório GitHub
gh repo create all-max-mind \
  --public \
  --source=. \
  --remote=origin \
  --push

# Ou manualmente:
git remote add origin https://github.com/AllMaxMind/all-max-mind.git
git branch -M main
git push -u origin main
```

#### 5D: Adicionar GitHub Secrets
```bash
gh secret create VERCEL_TOKEN --body "seu-token"
gh secret create VERCEL_ORG_ID --body "seu-org-id"
gh secret create VERCEL_PROJECT_ID --body "seu-project-id"

# Verificar
gh secret list
```

---

### PASSO 6: Configurar .env.local (5 minutos)

```bash
# Windows PowerShell
$env_content = @"
VITE_SUPABASE_URL=https://[seu-project-id].supabase.co
VITE_SUPABASE_ANON_KEY=[sua-anon-key]
VITE_GEMINI_API_KEY=[sua-gemini-api-key]
SENTRY_DSN=https://[key]@sentry.io/[id]
SUPABASE_SERVICE_ROLE_KEY=[sua-service-role-key]
"@
Set-Content -Path .env.local -Value $env_content

# Verificar
Get-Content .env.local
```

---

### PASSO 7: Testar Tudo Localmente (15 minutos)

```bash
# Instalar dependências
npm install

# Verificar tipos
npm run typecheck
# Deve: ✅ PASS

# Verificar linting
npm run lint
# Deve: ✅ PASS

# Rodar testes
npm test
# Deve: ✅ All tests passed

# Build de produção
npm run build
# Deve: ✅ dist/ criado

# Iniciar dev
npm run dev
# Acesse: http://localhost:3000
# Deve: ✅ Aplicação carrega
```

✅ **Tudo passou?** Sistema está 100% funcional!

---

## 📋 CHECKLIST FINAL

```
SUPABASE:
  ☐ Projeto criado
  ☐ Schema importado
  ☐ RLS aplicado
  ☐ Credenciais guardadas

GEMINI API:
  ☐ API habilitada
  ☐ API Key gerada
  ☐ Restrições configuradas
  ☐ Teste via curl bem-sucedido

SENTRY (opcional):
  ☐ Projeto criado
  ☐ DSN obtido

VERCEL:
  ☐ Projeto criado
  ☐ GitHub conectado
  ☐ Environment vars adicionadas
  ☐ Build bem-sucedido

GITHUB:
  ☐ Repositório criado
  ☐ Código feito push
  ☐ Secrets adicionados
  ☐ Branch protection ativado

LOCAL:
  ☐ .env.local configurado
  ☐ npm install OK
  ☐ typecheck OK
  ☐ lint OK
  ☐ tests OK
  ☐ build OK
  ☐ npm run dev OK
```

Se todos ☐ estão marcados, você está pronto!

---

## 🚀 PRÓXIMOS PASSOS

### Imediatamente:

```bash
# 1. Instalar pre-push hooks
cp scripts/pre-push-hook.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push

# 2. Testar um push
echo "# Test" >> TEST.md
git add TEST.md
git commit -m "test: verify hooks"
git push
# Deve rodar quality gates automaticamente
```

### Nos próximos dias:

```bash
# 1. Monitorar primeira deploy
# Acesse: https://vercel.com/all-max-mind

# 2. Testar aplicação em staging
# URL: https://all-max-mind-[hash].vercel.app

# 3. Fazer deploy em produção
# Merge para main → Deploy automático
```

---

## ⚠️ TROUBLESHOOTING RÁPIDO

### "VITE_SUPABASE_URL is not defined"
```bash
# Verificar .env.local
Get-Content .env.local
# Se vazio, adicione manualmente usando Passo 6
```

### "Cannot connect to Supabase"
```bash
# Testar URL
curl https://[seu-project].supabase.co/rest/v1/
# Deve retornar JSON, não erro
```

### "Gemini API returns 401"
```bash
# Verificar chave
echo $env:VITE_GEMINI_API_KEY
# Chave não pode estar entre aspas
```

### "git push fails"
```bash
# Verificar autenticação
gh auth status
# Se "Not authenticated":
gh auth login
```

### "GitHub Actions fail"
```bash
# Verificar secrets
gh secret list
# Deve mostrar: VERCEL_TOKEN, VERCEL_ORG_ID, etc
```

---

## 📞 REFERÊNCIAS RÁPIDAS

| Serviço | URL | Ação |
|---------|-----|------|
| Supabase | https://app.supabase.com | Dashboard |
| Google Cloud | https://console.cloud.google.com | API Keys |
| Sentry | https://sentry.io | Error tracking |
| Vercel | https://vercel.com | Deployments |
| GitHub | https://github.com/AllMaxMind/all-max-mind | Código |

---

## 📚 DOCUMENTAÇÃO COMPLETA

Depois que tudo estiver funcionando:

1. **Entender tudo:** `docs/DEVOPS_DEPLOYMENT_GUIDE.md`
2. **Próximos passos:** `docs/DEVOPS_ACTION_PLAN.md`
3. **Troubleshooting:** `docs/DEVOPS_DEPLOYMENT_GUIDE.md` → Troubleshooting
4. **Detalhado:** `docs/SETUP_SECRETS_TEMPLATE.md`

---

## ✅ SUCESSO!

Se completou todos os 7 passos + checklist:

✅ Sistema funcionando localmente
✅ Integrado com Supabase
✅ Conectado ao Gemini API
✅ Deployado no Vercel
✅ DevOps pipelines configurados

**Você está pronto para desenvolvimento!** 🚀

---

**Documento:** SETUP_QUICKSTART.md
**Tempo:** ~1-2 horas
**Resultado:** Sistema 100% funcional
**Próximo:** Ler DEVOPS_DEPLOYMENT_GUIDE.md para operações
