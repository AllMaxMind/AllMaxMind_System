# Guia de Segurança Supabase - All Max Mind System

**Criado em:** 2026-02-01
**Última atualização:** 2026-02-01
**Autor:** @dev (Dex)

---

## Lições Aprendidas (NÃO REPETIR!)

### 1. Views NÃO herdam RLS automaticamente!

**ERRADO:**
```sql
CREATE VIEW lead_analytics AS
SELECT * FROM leads;
-- ❌ View executa como DEFINER (owner), IGNORA RLS!
```

**CORRETO:**
```sql
CREATE VIEW lead_analytics
WITH (security_invoker = true)  -- ✅ Herda RLS do usuário
AS
SELECT * FROM leads;
```

### 2. Tabelas precisam de ENABLE + FORCE RLS

```sql
-- Apenas ENABLE não é suficiente para o owner da tabela
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE leads FORCE ROW LEVEL SECURITY;  -- ✅ Aplica RLS mesmo para owner
```

### 3. Comparação de tipos em RLS policies

**ERRADO:**
```sql
-- UUID comparado com TEXT causa erro
WHERE visitor_id IN (SELECT id FROM visitors WHERE ...)
```

**CORRETO:**
```sql
-- Usar EXISTS para evitar problemas de tipo
WHERE EXISTS (
  SELECT 1 FROM visitors v
  WHERE v.id = sessions.visitor_id
  AND v.anonymous_id = 'value'
)
```

### 4. DROP POLICY IF EXISTS antes de CREATE

Sempre dropar policies existentes antes de criar novas:
```sql
DROP POLICY IF EXISTS "policy_name" ON table_name;
CREATE POLICY "policy_name" ON table_name ...;
```

---

## Checklist de Segurança para Novas Tabelas

- [ ] `ALTER TABLE xxx ENABLE ROW LEVEL SECURITY;`
- [ ] `ALTER TABLE xxx FORCE ROW LEVEL SECURITY;`
- [ ] Criar policy para `INSERT` (funnel entry)
- [ ] Criar policy para `SELECT` (user isolation)
- [ ] Criar policy para `UPDATE` (user ownership)
- [ ] Criar policy para `service_role` (backend access)
- [ ] Testar com usuário anônimo
- [ ] Testar com usuário autenticado
- [ ] Verificar no Supabase Dashboard (não deve mostrar "UNRESTRICTED")

---

## Checklist de Segurança para Novas Views

- [ ] Usar `WITH (security_invoker = true)` na criação
- [ ] `GRANT SELECT ON view_name TO authenticated;`
- [ ] `GRANT SELECT ON view_name TO service_role;`
- [ ] Verificar que a tabela base tem RLS habilitado
- [ ] Testar que view respeita RLS da tabela base

---

## Estrutura RLS Padrão

### Para tabelas com dados de usuário (leads, problems, etc.)

```sql
-- 1. Enable RLS
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;

-- 2. Drop existing policies
DROP POLICY IF EXISTS "anon_insert" ON table_name;
DROP POLICY IF EXISTS "user_select_own" ON table_name;
DROP POLICY IF EXISTS "user_update_own" ON table_name;
DROP POLICY IF EXISTS "service_role_all" ON table_name;

-- 3. Anonymous can insert (funnel entry)
CREATE POLICY "anon_insert" ON table_name
  FOR INSERT
  WITH CHECK (true);

-- 4. User can select own records
CREATE POLICY "user_select_own" ON table_name
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.role() = 'service_role'
  );

-- 5. User can update own records
CREATE POLICY "user_update_own" ON table_name
  FOR UPDATE
  USING (user_id = auth.uid() OR auth.role() = 'service_role');

-- 6. Service role can do everything
CREATE POLICY "service_role_all" ON table_name
  FOR ALL
  USING (auth.role() = 'service_role');

-- 7. Grant permissions
GRANT SELECT, INSERT, UPDATE ON table_name TO anon;
GRANT SELECT, INSERT, UPDATE ON table_name TO authenticated;
GRANT ALL ON table_name TO service_role;
```

### Para tabelas de tracking (visitors, sessions)

```sql
-- RLS habilitado mas permissivo para tracking anônimo
ALTER TABLE table_name ENABLE ROW LEVEL SECURITY;
ALTER TABLE table_name FORCE ROW LEVEL SECURITY;

-- Service role full access
CREATE POLICY "service_role_all" ON table_name
  FOR ALL USING (auth.role() = 'service_role');

-- Anon can insert/select/update (tracking requer isso)
CREATE POLICY "anon_insert" ON table_name
  FOR INSERT WITH CHECK (true);

CREATE POLICY "anon_select" ON table_name
  FOR SELECT USING (true);

CREATE POLICY "anon_update" ON table_name
  FOR UPDATE USING (true);
```

### Para views analíticas

```sql
-- SEMPRE usar security_invoker!
CREATE VIEW view_name
WITH (security_invoker = true)
AS
SELECT ... FROM base_table ...;

GRANT SELECT ON view_name TO authenticated;
GRANT SELECT ON view_name TO service_role;
```

---

## Status Atual das Tabelas (2026-02-01)

| Tabela | RLS | FORCE | Policies | Status |
|--------|-----|-------|----------|--------|
| leads | ✅ | ✅ | 4 | Seguro |
| problems | ✅ | ✅ | 3 | Seguro |
| dimensions | ✅ | ✅ | 3 | Seguro |
| questions_answers | ✅ | ✅ | 3 | Seguro |
| blueprints | ✅ | - | 2 | Seguro |
| problem_embeddings | ✅ | - | 2 | Seguro |
| effective_questions | ✅ | - | 2 | Seguro |
| email_logs | ✅ | - | 3 | Seguro |
| email_queue | ✅ | - | 3 | Seguro |
| email_sequences | ✅ | - | 2 | Seguro |
| lead_interactions | ✅ | - | 3 | Seguro |
| visitors | ✅ | ✅ | 4 | Seguro* |
| sessions | ✅ | ✅ | 4 | Seguro* |

*Permissivo para tracking anônimo

| View | Security Invoker | Status |
|------|-----------------|--------|
| lead_analytics | ✅ | Seguro |
| lead_summary | ✅ | Seguro |
| email_sequence_stats | ✅ | Seguro |

---

## Comandos Úteis de Debug

### Verificar se tabela tem RLS habilitado
```sql
SELECT tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public';
```

### Listar policies de uma tabela
```sql
SELECT policyname, tablename, cmd, qual, with_check
FROM pg_policies
WHERE tablename = 'leads';
```

### Verificar se view tem security_invoker
```sql
SELECT viewname, definition
FROM pg_views
WHERE schemaname = 'public';
```

### Testar RLS como usuário específico
```sql
-- No Supabase, usar o Role dropdown no SQL Editor
-- ou usar set_config para simular contexto
SELECT set_config('request.jwt.claims', '{"sub":"user-uuid","role":"authenticated"}', true);
```

---

## Referências

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [PostgreSQL Views Security](https://www.postgresql.org/docs/current/sql-createview.html)

---

*Este documento foi criado após resolver problemas de segurança críticos em 2026-02-01.*
*SEMPRE consultar antes de criar novas tabelas ou views!*
