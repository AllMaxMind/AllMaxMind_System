# 🔧 Localhost Testing - Error Fixes
**All Max Mind System - Debugging Sprint**

**Data**: 2026-01-28
**Erros Encontrados**: 3 (RLS, 401 Unauthorized, CORS)
**Status**: ⏳ AGUARDANDO CORREÇÕES SUPABASE

---

## 🔴 Erros Encontrados

### Erro #1: 401 Unauthorized na Sessions Table
**Mensagem**: POST https://.../rest/v1/sessions 401
**Causa**: RLS policy bloqueando anon insert
**Status**: ❌ BLOQUEADOR

### Erro #2: RLS Policy Violation
**Mensagem**: "new row violates row level security policy for table 'sessions'"
**Causa**: Tabela sessions tem RLS habilitada mas sem policy para anon
**Status**: ❌ BLOQUEADOR

### Erro #3: CORS Error na Edge Function
**Mensagem**: "CORS policy: Response to preflight request doesn't pass"
**Causa**: Edge Function não deployed OU CORS headers faltando
**Status**: ❌ BLOQUEADOR (Phase 1)

---

## 📋 AÇÕES IMEDIATAS (Você fazer)

### ✅ AÇÃO 1: Executar Script SQL no Supabase
**Local**: FIX_RLS_POLICIES.sql (arquivo criado neste projeto)

**Passos**:
1. Acesse: https://app.supabase.com → seu projeto
2. Vá para: SQL Editor
3. Clique: "+ New Query"
4. Cole todo o conteúdo de `FIX_RLS_POLICIES.sql`
5. Clique: "Run" (Ctrl+Enter)
6. Resultado deve ser: `SUCCESS`

**O que isso faz**:
- Desabilita RLS nas tabelas `sessions` e `visitors` (temporary fix)
- Permite que anon users façam INSERT/SELECT
- Desbloqueia os erros 401 e RLS Policy

---

### ✅ AÇÃO 2: Verificar Edge Functions
**Passos**:
1. No terminal, execute:
   ```bash
   cd C:\Users\adria\codes\All_Max_Mind_System
   supabase functions list
   ```

2. Resultado esperado:
   ```
   NAME                  STATUS
   analyze-problem       ACTIVE
   generate-questions    ACTIVE
   ```

3. Se alguma estiver `MISSING` ou não listar:
   ```bash
   supabase functions deploy analyze-problem
   supabase functions deploy generate-questions
   ```

---

### ✅ AÇÃO 3: Verificar Gemini API Key no Supabase
**Passos**:
1. Acesse: https://app.supabase.com → seu projeto
2. Vá para: Project Settings → Secrets
3. Verifique se existe:
   - `GEMINI_API_KEY` = sua chave válida
   - Se não existir, crie: "New Secret" com a chave

4. Você pode testar a chave em: https://aistudio.google.com/

---

## 📊 Ordem de Execução

```
1️⃣ SQL Fix (RLS Policies) → IMEDIATO
   ↓ (aguardar sucesso)
2️⃣ Verificar Edge Functions → IMEDIATO
   ↓ (se faltar, fazer deploy)
3️⃣ Verificar Gemini Secrets → IMEDIATO
   ↓ (se faltar, criar)
4️⃣ Testar Localhost novamente → IMEDIATO
   ↓ (refreshar página, tentar Phase 1)
```

---

## 🎯 Teste Pós-Fix

Uma vez que você executar as 3 ações acima:

1. **Ir para**: http://localhost:3001/
2. **F5** para refreshar
3. **Clicar**: "ANALISAR MINHA DOR COM IA" novamente
4. **Aguardar**: ~10 segundos
5. **Resultado esperado**:
   ✅ Nenhum erro visual
   ✅ Console limpo (sem 401, CORS, RLS)
   ✅ Problem salvo no Supabase

---

## 📝 Arquivo SQL Gerado

**Localização**: `FIX_RLS_POLICIES.sql`

**Conteúdo**:
```sql
ALTER TABLE public.visitors DISABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;

CREATE POLICY "anon_read_own_sessions" ON public.sessions FOR SELECT USING (true);
CREATE POLICY "anon_read_own_visitors" ON public.visitors FOR SELECT USING (true);
CREATE POLICY "anon_insert_sessions" ON public.sessions FOR INSERT WITH CHECK (true);
CREATE POLICY "anon_insert_visitors" ON public.visitors FOR INSERT WITH CHECK (true);
```

---

## 🚨 SE ENCONTRAR ERROS NA EXECUÇÃO DO SQL

**Erro**: "Policy already exists"
- **Solução**: Apague o script, execute apenas as linhas DISABLE:
  ```sql
  ALTER TABLE public.visitors DISABLE ROW LEVEL SECURITY;
  ALTER TABLE public.sessions DISABLE ROW LEVEL SECURITY;
  ```

**Erro**: "Function not found"
- **Solução**: Edge Functions não deployed. Execute:
  ```bash
  supabase functions deploy analyze-problem
  supabase functions deploy generate-questions
  ```

---

## 📞 Próximos Passos

Uma vez que você completar as 3 ações e testar:

1. **Se FUNCIONAR** → Compartilhe screenshot de sucesso
2. **Se FALHAR** → Compartilhe novo erro + console log
3. Continuaremos debugging até 100% passar ✅

---

## ⏱️ Tempo Estimado

- ⏱️ SQL execution: < 1 minuto
- ⏱️ Edge Functions check: < 2 minutos
- ⏱️ Secrets verification: < 2 minutos
- ⏱️ Re-test: < 5 minutos
- **Total: ~10 minutos**

---

**Status Atual**: ⏳ Aguardando suas ações
**Próximo**: Aguardando confirmação de sucesso do fix
