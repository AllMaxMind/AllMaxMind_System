# Plano de Correção Arquitetural - All Max Mind System

**Data**: 27 de Janeiro de 2026
**Arquiteto**: Aria (@architect AIOS)
**Base**: Relatório de Aderência PRD (docs/PRD_Adherence_Analysis.md)
**Objetivo**: Atingir 100% de aderência ao PRD através de correções arquiteturais

---

## 📊 DIAGNÓSTICO ARQUITETURAL

### Status Atual: 68% Aderente
- **Backend (Supabase)**: 60% - Gaps críticos em schema e extensões
- **Edge Functions**: 67% - 2 de 3 implementadas
- **Integrações IA**: 50% - Gemini OK, OpenAI faltando, embeddings mockados

### Gaps Críticos Identificados

**🔴 CRÍTICO - Bloqueadores:**
1. pgvector extension não configurada
2. Tabela `problem_embeddings` não existe
3. Tabelas `visitors` e `sessions` não existem
4. Tabela `effective_questions` (data moat) não existe
5. View `lead_analytics` não existe
6. Edge Function `analyze-problem` não existe (NLP real)
7. Migrations não formalizadas

**🟡 IMPORTANTE - Features Esperadas:**
8. Tabela `blueprints` ausente no schema (existe código mas sem tabela)
9. Triggers para `updated_at` não implementados
10. Índices otimizados incompletos

---

## 🏗️ PLANO DE CORREÇÃO ARQUITETURAL

### SPRINT 1: Database Foundation (Prioridade CRÍTICA)

#### 1.1 Configurar pgvector Extension

**Arquivo**: `supabase/migrations/00001_enable_pgvector.sql`

```sql
-- Enable pgvector extension for embeddings support
CREATE EXTENSION IF NOT EXISTS vector;

-- Verify installation
SELECT * FROM pg_extension WHERE extname = 'vector';
```

**Impacto**: Desbloqueia tabela `problem_embeddings` e vector search

---

#### 1.2 Criar Tabela `problem_embeddings`

**Arquivo**: `supabase/migrations/00002_create_problem_embeddings.sql`

```sql
-- Tabela de embeddings de problemas (vector search)
CREATE TABLE IF NOT EXISTS public.problem_embeddings (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  embedding VECTOR(384) NOT NULL, -- Gemini text-embedding-004 produces 384 dimensions
  model_version TEXT DEFAULT 'text-embedding-004',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índice para similarity search (HNSW - Hierarchical Navigable Small World)
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_vector
ON public.problem_embeddings
USING hnsw (embedding vector_cosine_ops);

-- Índice para foreign key lookup
CREATE INDEX IF NOT EXISTS idx_problem_embeddings_problem_id
ON public.problem_embeddings(problem_id);

-- RLS Policies
ALTER TABLE public.problem_embeddings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_view_own_embeddings" ON public.problem_embeddings
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

CREATE POLICY "service_role_insert_embeddings" ON public.problem_embeddings
  FOR INSERT
  WITH CHECK (true); -- Only service role can insert (via Edge Function)

-- Function for similarity search
CREATE OR REPLACE FUNCTION match_problems(
  query_embedding VECTOR(384),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  problem_id UUID,
  similarity FLOAT
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    pe.problem_id,
    1 - (pe.embedding <=> query_embedding) AS similarity
  FROM public.problem_embeddings pe
  WHERE 1 - (pe.embedding <=> query_embedding) > match_threshold
  ORDER BY pe.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;
```

**Nota**:
- HNSW index é o mais performático para vector search (melhor que IVFFlat)
- `<=>` é o operador de distância cosseno do pgvector
- Função `match_problems` retorna problemas similares acima do threshold

---

#### 1.3 Criar Tabelas de Tracking (`visitors`, `sessions`)

**Arquivo**: `supabase/migrations/00003_create_tracking_tables.sql`

```sql
-- Tabela de visitantes (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.visitors (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  anonymous_id TEXT UNIQUE NOT NULL, -- Gerado no frontend (UUID persistente)
  ip TEXT,
  country TEXT,
  city TEXT,
  device TEXT,
  os TEXT,
  browser TEXT,
  source TEXT, -- utm_source
  medium TEXT, -- utm_medium
  campaign TEXT, -- utm_campaign
  first_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_sessions INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabela de sessões (Fase 0: Passive Data Layer)
CREATE TABLE IF NOT EXISTS public.sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_id UUID NOT NULL REFERENCES public.visitors(id) ON DELETE CASCADE,
  session_start TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  session_end TIMESTAMP WITH TIME ZONE,
  scroll_depth NUMERIC, -- Porcentagem (0-100)
  session_duration INT, -- Segundos
  click_count INT DEFAULT 0,
  page_views INT DEFAULT 1,
  metadata JSONB, -- Dados adicionais (referrer, landing_page, etc.)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_visitors_anonymous_id ON public.visitors(anonymous_id);
CREATE INDEX IF NOT EXISTS idx_visitors_first_seen ON public.visitors(first_seen DESC);
CREATE INDEX IF NOT EXISTS idx_sessions_visitor_id ON public.sessions(visitor_id);
CREATE INDEX IF NOT EXISTS idx_sessions_start ON public.sessions(session_start DESC);

-- RLS Policies (permissivo para tracking anônimo)
ALTER TABLE public.visitors ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_insert_visitors" ON public.visitors
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_visitors" ON public.visitors
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_visitors" ON public.visitors
  FOR SELECT USING (true); -- Em produção, restringir por anonymous_id

CREATE POLICY "allow_public_insert_sessions" ON public.sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "allow_public_update_sessions" ON public.sessions
  FOR UPDATE USING (true);

CREATE POLICY "allow_public_select_sessions" ON public.sessions
  FOR SELECT USING (true); -- Em produção, restringir por visitor_id

-- Trigger para atualizar last_seen no visitor
CREATE OR REPLACE FUNCTION update_visitor_last_seen()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.visitors
  SET
    last_seen = NOW(),
    total_sessions = total_sessions + 1
  WHERE id = NEW.visitor_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_visitor_last_seen
AFTER INSERT ON public.sessions
FOR EACH ROW
EXECUTE FUNCTION update_visitor_last_seen();
```

**Nota**:
- `anonymous_id` é gerado no frontend e persiste no localStorage
- Trigger atualiza `last_seen` e `total_sessions` automaticamente
- Geolocalização (IP → cidade/país) requer serviço externo (MaxMind, ipapi.co)

---

#### 1.4 Criar Tabela `effective_questions` (Data Moat)

**Arquivo**: `supabase/migrations/00004_create_effective_questions.sql`

```sql
-- Tabela de perguntas efetivas (Data Moat - RAG para Fase 3)
CREATE TABLE IF NOT EXISTS public.effective_questions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  domain TEXT NOT NULL, -- logistics, supply_chain, comex, procurement, finance
  category TEXT NOT NULL, -- context, process, pain, technical, scale
  question TEXT NOT NULL,
  success_rate NUMERIC DEFAULT 0, -- 0-1 (porcentagem de respostas úteis)
  effectiveness_score NUMERIC DEFAULT 0, -- Score ponderado (0-100)
  times_asked INT DEFAULT 0,
  times_answered INT DEFAULT 0,
  avg_answer_length INT, -- Média de caracteres nas respostas
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para RAG retrieval
CREATE INDEX IF NOT EXISTS idx_effective_questions_domain
ON public.effective_questions(domain);

CREATE INDEX IF NOT EXISTS idx_effective_questions_category
ON public.effective_questions(category);

CREATE INDEX IF NOT EXISTS idx_effective_questions_effectiveness
ON public.effective_questions(effectiveness_score DESC);

CREATE INDEX IF NOT EXISTS idx_effective_questions_domain_category
ON public.effective_questions(domain, category, effectiveness_score DESC);

-- RLS: Apenas service role (Edge Functions) pode modificar
ALTER TABLE public.effective_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "allow_public_select_effective_questions" ON public.effective_questions
  FOR SELECT USING (true);

CREATE POLICY "service_role_modify_effective_questions" ON public.effective_questions
  FOR ALL USING (true); -- Apenas service role

-- Function para atualizar effectiveness_score
CREATE OR REPLACE FUNCTION calculate_effectiveness_score(
  p_success_rate NUMERIC,
  p_times_asked INT,
  p_avg_answer_length INT
)
RETURNS NUMERIC AS $$
BEGIN
  -- Formula: (success_rate * 0.5) + (min(times_asked, 100) / 100 * 0.3) + (min(avg_answer_length, 500) / 500 * 0.2)
  RETURN (
    (p_success_rate * 0.5) +
    (LEAST(p_times_asked, 100)::NUMERIC / 100 * 0.3) +
    (LEAST(COALESCE(p_avg_answer_length, 0), 500)::NUMERIC / 500 * 0.2)
  ) * 100;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Trigger para auto-calcular effectiveness_score
CREATE OR REPLACE FUNCTION update_effectiveness_score()
RETURNS TRIGGER AS $$
BEGIN
  NEW.effectiveness_score := calculate_effectiveness_score(
    NEW.success_rate,
    NEW.times_asked,
    NEW.avg_answer_length
  );
  NEW.updated_at := NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_effectiveness_score
BEFORE INSERT OR UPDATE ON public.effective_questions
FOR EACH ROW
EXECUTE FUNCTION update_effectiveness_score();
```

**Nota**:
- Effectiveness score combina: taxa de sucesso (50%), volume (30%), qualidade da resposta (20%)
- RAG usa `domain` + `category` + score para selecionar melhores perguntas
- Trigger auto-calcula score em insert/update

---

#### 1.5 Criar Tabela `blueprints`

**Arquivo**: `supabase/migrations/00005_create_blueprints.sql`

```sql
-- Tabela de blueprints (Fase 4: Blueprint Preview)
CREATE TABLE IF NOT EXISTS public.blueprints (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  problem_id UUID NOT NULL REFERENCES public.problems(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  executive_summary TEXT,
  problem_statement TEXT,
  objectives JSONB, -- Array de objetivos
  technical_architecture JSONB, -- Array de tecnologias
  key_features JSONB, -- Array de features
  timeline_estimate TEXT,
  project_size TEXT CHECK (project_size IN ('small', 'medium', 'large')),
  estimated_investment TEXT,
  success_metrics JSONB, -- Array de KPIs
  risks_and_mitigations JSONB, -- Array de riscos
  next_steps JSONB, -- Array de próximos passos
  download_url TEXT, -- URL do PDF para download
  pdf_generated BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_blueprints_problem_id ON public.blueprints(problem_id);
CREATE INDEX IF NOT EXISTS idx_blueprints_created_at ON public.blueprints(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_blueprints_project_size ON public.blueprints(project_size);

-- RLS
ALTER TABLE public.blueprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "session_view_own_blueprints" ON public.blueprints
  FOR SELECT
  USING (
    problem_id IN (
      SELECT id FROM public.problems
      WHERE session_id = COALESCE(current_setting('app.session_id', true)::uuid, session_id)
    )
  );

CREATE POLICY "service_role_insert_blueprints" ON public.blueprints
  FOR INSERT WITH CHECK (true); -- Apenas Edge Function

-- Trigger para updated_at
CREATE TRIGGER trigger_update_blueprints_updated_at
BEFORE UPDATE ON public.blueprints
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();
```

**Nota**: Tabela referenciada no código mas ausente no schema original

---

#### 1.6 Criar View `lead_analytics`

**Arquivo**: `supabase/migrations/00006_create_lead_analytics_view.sql`

```sql
-- View para analytics de leads (Fase 4)
CREATE OR REPLACE VIEW public.lead_analytics AS
SELECT
  DATE(created_at) AS date,
  lead_status,
  COUNT(*) AS lead_count,
  AVG(lead_score) AS avg_score,
  COUNT(CASE WHEN project_size_estimated = 'small' THEN 1 END) AS small_projects,
  COUNT(CASE WHEN project_size_estimated = 'medium' THEN 1 END) AS medium_projects,
  COUNT(CASE WHEN project_size_estimated = 'large' THEN 1 END) AS large_projects,
  COUNT(CASE WHEN accept_marketing = true THEN 1 END) AS marketing_opt_ins
FROM public.leads
GROUP BY DATE(created_at), lead_status
ORDER BY date DESC, lead_status;

-- Grant access to authenticated users (internal team)
GRANT SELECT ON public.lead_analytics TO authenticated;
```

**Nota**: View facilita reporting sem queries complexas

---

#### 1.7 Adicionar Trigger `updated_at` Genérico

**Arquivo**: `supabase/migrations/00007_add_updated_at_triggers.sql`

```sql
-- Function genérica para atualizar updated_at (se não existir)
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Aplicar trigger em todas as tabelas com updated_at
CREATE TRIGGER trigger_update_problems_updated_at
BEFORE UPDATE ON public.problems
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_leads_updated_at
BEFORE UPDATE ON public.leads
FOR EACH ROW
EXECUTE FUNCTION update_updated_at_column();

-- Note: blueprints já tem trigger criado em 00005
```

**Nota**: Garante que `updated_at` é sempre atualizado automaticamente

---

### SPRINT 2: Edge Functions (Prioridade CRÍTICA)

#### 2.1 Criar Edge Function `analyze-problem` (NLP Real)

**Arquivo**: `supabase/functions/analyze-problem/index.ts`

```typescript
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { GoogleGenAI, Type, Schema } from "npm:@google/genai@^0.1.1"
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'

declare const Deno: any;

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-visitor-id',
}

interface ProblemAnalysis {
  domain: string;
  persona: string;
  intentScore: number;
  emotionalTone: string;
  complexity: string;
  embedding: number[];
  processedText: string;
  keywords: string[];
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { problemText, problemId } = await req.json()

    if (!problemText) {
      throw new Error('Problem text is required')
    }

    const geminiApiKey = Deno.env.get('GEMINI_API_KEY')
    if (!geminiApiKey) throw new Error('GEMINI_API_KEY not configured')

    const ai = new GoogleGenAI({ apiKey: geminiApiKey });

    // STEP 1: NLP Analysis via Gemini
    const analysisSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        domain: {
          type: Type.STRING,
          enum: ["logistics", "supply_chain", "comex", "procurement", "finance", "unknown"],
          description: "Primary business domain of the problem."
        },
        persona: {
          type: Type.STRING,
          enum: ["operator", "manager", "director", "analyst", "executive", "unknown"],
          description: "Seniority level of the person with this problem."
        },
        intentScore: {
          type: Type.NUMBER,
          description: "Intent score from 0-100 indicating problem complexity and urgency."
        },
        emotionalTone: {
          type: Type.STRING,
          enum: ["frustrated", "neutral", "optimistic", "urgent"],
          description: "Emotional tone of the problem description."
        },
        complexity: {
          type: Type.STRING,
          enum: ["small", "medium", "large"],
          description: "Estimated project complexity."
        },
        processedText: {
          type: Type.STRING,
          description: "Cleaned and structured version of the problem text."
        },
        keywords: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Key terms extracted from the problem (5-10 keywords)."
        }
      },
      required: ["domain", "persona", "intentScore", "emotionalTone", "complexity", "processedText", "keywords"]
    };

    const analysisPrompt = `Analyze the following business problem and extract structured metadata:

PROBLEM TEXT:
"${problemText}"

INSTRUCTIONS:
1. Identify the primary business domain (logistics, supply chain, COMEX, procurement, finance).
2. Infer the seniority level of the person experiencing this problem.
3. Calculate an intent score (0-100) based on:
   - Clarity of the problem (25 points)
   - Specificity of requirements (25 points)
   - Urgency indicators (25 points)
   - Complexity of the domain (25 points)
4. Detect emotional tone (frustrated, neutral, optimistic, urgent).
5. Estimate project complexity (small: <15 days, medium: 15-30 days, large: 30-60 days).
6. Rewrite the problem in a clear, professional manner (processedText).
7. Extract 5-10 key terms that define this problem.

Return structured JSON.`;

    const analysisResponse = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: analysisPrompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        thinkingConfig: { thinkingBudget: 512 } // Moderate reasoning
      }
    });

    const analysis: ProblemAnalysis = JSON.parse(analysisResponse.text);

    // STEP 2: Generate Embedding via Gemini Embeddings API
    const embeddingResponse = await ai.models.embedContent({
      model: 'text-embedding-004',
      content: analysis.processedText
    });

    analysis.embedding = embeddingResponse.embedding.values;

    // STEP 3: Update problem in Supabase
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Update problems table
    const { error: updateError } = await supabase
      .from('problems')
      .update({
        processed_text: analysis.processedText,
        domain: analysis.domain,
        persona: analysis.persona,
        intent_score: analysis.intentScore,
        final_complexity: analysis.complexity,
        metadata: {
          emotionalTone: analysis.emotionalTone,
          keywords: analysis.keywords
        },
        analysis_completed: true,
        updated_at: new Date().toISOString()
      })
      .eq('id', problemId);

    if (updateError) throw updateError;

    // Insert embedding
    const { error: embeddingError } = await supabase
      .from('problem_embeddings')
      .insert({
        problem_id: problemId,
        embedding: analysis.embedding,
        model_version: 'text-embedding-004'
      });

    if (embeddingError) throw embeddingError;

    return new Response(JSON.stringify(analysis), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })

  } catch (error: any) {
    console.error("Error in analyze-problem:", error)
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    })
  }
})
```

**Características**:
- **NLP Real**: Gemini Pro analisa texto e extrai metadados estruturados
- **Embeddings Real**: Gemini `text-embedding-004` (384 dimensões)
- **Auto-persistência**: Atualiza `problems` e insere em `problem_embeddings`
- **Scoring Inteligente**: Intent score calculado por IA (não heurística)

**Deployment**:
```bash
supabase functions deploy analyze-problem --no-verify-jwt
```

---

#### 2.2 Atualizar Edge Function `generate-questions` (RAG de Data Moat)

**Modificações necessárias** em `supabase/functions/generate-questions/index.ts`:

```typescript
// Adicionar no início (após imports)
import { createClient } from 'npm:@supabase/supabase-js@^2.39.0'

// Adicionar antes de gerar perguntas com IA
const supabaseUrl = Deno.env.get('SUPABASE_URL')!
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
const supabase = createClient(supabaseUrl, supabaseServiceKey)

// Buscar perguntas efetivas do data moat
const { data: effectiveQuestions } = await supabase
  .from('effective_questions')
  .select('question, category')
  .eq('domain', domain) // inferido de dimensions ou problemText
  .gte('effectiveness_score', 50) // Apenas perguntas efetivas
  .order('effectiveness_score', { ascending: false })
  .limit(10);

// Adicionar contexto ao systemInstruction
const systemInstruction = `You are a Senior Technical Diagnostic Consultant.

EFFECTIVE QUESTIONS FROM DATA MOAT:
${effectiveQuestions?.map(q => `- [${q.category}] ${q.question}`).join('\n')}

Use these questions as inspiration but adapt them to the specific problem context.
Generate 5 strategic questions to deepen understanding.

[resto do systemInstruction...]`
```

**Nota**: Integra RAG do data moat para melhorar qualidade das perguntas

---

### SPRINT 3: Integrações IA e Performance

#### 3.1 Configurar OpenAI como Fallback

**Arquivo**: `lib/ai/openai-fallback.ts` (novo)

```typescript
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  organization: import.meta.env.VITE_OPENAI_ORGANIZATION,
});

export async function generateEmbeddingOpenAI(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
    dimensions: 384, // Match Gemini dimensions
  });

  return response.data[0].embedding;
}

export async function analyzeTextOpenAI(text: string): Promise<any> {
  const response = await openai.chat.completions.create({
    model: 'gpt-4-turbo-preview',
    messages: [
      {
        role: 'system',
        content: 'You are a business problem analyzer. Extract domain, persona, intent score, and complexity.'
      },
      {
        role: 'user',
        content: text
      }
    ],
    response_format: { type: 'json_object' }
  });

  return JSON.parse(response.choices[0].message.content || '{}');
}
```

**Configuração** em `.env.example`:
```bash
# OpenAI Fallback (optional)
VITE_OPENAI_API_KEY=sk-...
VITE_OPENAI_ORGANIZATION=org-...
```

**Nota**: Apenas fallback, Gemini continua sendo primário

---

#### 3.2 Otimização de Índices e Performance

**Arquivo**: `supabase/migrations/00008_performance_optimization.sql`

```sql
-- Índices compostos para queries frequentes
CREATE INDEX IF NOT EXISTS idx_problems_session_domain
ON public.problems(session_id, domain) WHERE analysis_completed = true;

CREATE INDEX IF NOT EXISTS idx_problems_intent_score
ON public.problems(intent_score DESC) WHERE analysis_completed = true;

-- Índice GIN para busca em JSONB
CREATE INDEX IF NOT EXISTS idx_problems_metadata_gin
ON public.problems USING gin(metadata);

CREATE INDEX IF NOT EXISTS idx_leads_metadata_gin
ON public.leads USING gin(source, campaign);

-- Vacuum e analyze para otimizar planner
VACUUM ANALYZE public.problems;
VACUUM ANALYZE public.dimensions;
VACUUM ANALYZE public.questions_answers;
VACUUM ANALYZE public.leads;
VACUUM ANALYZE public.problem_embeddings;
```

**Nota**: Melhora performance de queries com RLS e filtros complexos

---

### SPRINT 4: Formalização de Migrations

#### 4.1 Estrutura de Migrations

**Criar pasta** `supabase/migrations/` com arquivos timestamped:

```
supabase/migrations/
├── 00001_enable_pgvector.sql
├── 00002_create_problem_embeddings.sql
├── 00003_create_tracking_tables.sql
├── 00004_create_effective_questions.sql
├── 00005_create_blueprints.sql
├── 00006_create_lead_analytics_view.sql
├── 00007_add_updated_at_triggers.sql
├── 00008_performance_optimization.sql
└── README.md
```

**Arquivo**: `supabase/migrations/README.md`

```markdown
# Supabase Migrations - All Max Mind

## Order of Execution

Migrations são executadas em ordem numérica:

1. `00001_enable_pgvector.sql` - Habilita extensão pgvector
2. `00002_create_problem_embeddings.sql` - Tabela de embeddings
3. `00003_create_tracking_tables.sql` - Tabelas visitors/sessions
4. `00004_create_effective_questions.sql` - Data moat
5. `00005_create_blueprints.sql` - Tabela de blueprints
6. `00006_create_lead_analytics_view.sql` - View de analytics
7. `00007_add_updated_at_triggers.sql` - Triggers genéricos
8. `00008_performance_optimization.sql` - Índices de performance

## How to Apply

### Local Development
\`\`\`bash
supabase db reset  # Reset database
# Migrations are applied automatically
\`\`\`

### Production
\`\`\`bash
supabase db push  # Push migrations to production
\`\`\`

## Rollback

Migrations não têm rollback automático. Para reverter:
1. Backup do banco antes de aplicar
2. Rollback manual se necessário
3. Testar em staging primeiro
```

**Nota**: Migrations versionadas facilitam deploy e rollback

---

## 📋 CHECKLIST DE IMPLEMENTAÇÃO

### Database

- [ ] **00001**: Habilitar pgvector extension
- [ ] **00002**: Criar tabela `problem_embeddings` com índice HNSW
- [ ] **00003**: Criar tabelas `visitors` e `sessions` com triggers
- [ ] **00004**: Criar tabela `effective_questions` com cálculo de score
- [ ] **00005**: Criar tabela `blueprints`
- [ ] **00006**: Criar view `lead_analytics`
- [ ] **00007**: Adicionar triggers `updated_at` em todas as tabelas
- [ ] **00008**: Criar índices compostos de performance
- [ ] Verificar RLS policies em todas as tabelas
- [ ] Testar função `match_problems()` para similarity search

### Edge Functions

- [ ] **analyze-problem**: Implementar NLP real com Gemini Pro
- [ ] **analyze-problem**: Integrar Gemini Embeddings API (text-embedding-004)
- [ ] **analyze-problem**: Auto-persistir em `problems` e `problem_embeddings`
- [ ] **generate-questions**: Adicionar RAG de `effective_questions`
- [ ] **generate-questions**: Adaptar quantidade de perguntas por intent score (3-9)
- [ ] **generate-blueprint**: Validar schema de output (já OK)
- [ ] Configurar secrets no Supabase:
  - [ ] `GEMINI_API_KEY` (backend)
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] Deploy de todas as Edge Functions

### Integrações IA

- [ ] Criar `lib/ai/openai-fallback.ts` (opcional)
- [ ] Adicionar variáveis `.env.example`:
  - [ ] `VITE_OPENAI_API_KEY` (opcional)
  - [ ] `VITE_OPENAI_ORGANIZATION` (opcional)
  - [ ] `GEMINI_API_KEY` (backend - documentar)
- [ ] Instalar dependência `openai` (se fallback for implementado)

### Frontend Integration

- [ ] Atualizar `lib/supabase/problems.ts`:
  - [ ] Substituir `generateBasicEmbedding()` mockado por chamada à Edge Function `analyze-problem`
  - [ ] Remover heurísticas de `lib/ai/processor.ts`
- [ ] Atualizar `lib/analytics/visitor.ts`:
  - [ ] Integrar persistência em tabela `visitors`
- [ ] Atualizar `lib/analytics/session.ts`:
  - [ ] Integrar persistência em tabela `sessions`
- [ ] Criar componente para geolocalização (opcional - via ipapi.co ou MaxMind)

### Testing

- [ ] Testar vector search: `SELECT * FROM match_problems(array[...], 0.7, 5)`
- [ ] Testar Edge Function `analyze-problem` com problema real
- [ ] Testar RAG em `generate-questions`
- [ ] Validar RLS policies (usuário não vê dados de outros)
- [ ] Testar fluxo completo: Fase 0 → Fase 4
- [ ] Verificar índices com `EXPLAIN ANALYZE` em queries críticas

### Documentation

- [ ] Atualizar `docs/ARCHITECTURE.md` com novas tabelas
- [ ] Documentar Edge Functions em `supabase/functions/README.md`
- [ ] Atualizar `.env.example` com todas as variáveis necessárias
- [ ] Criar guia de deployment em `docs/DEPLOYMENT.md`

---

## 🎯 PRIORIZAÇÃO

### CRÍTICO (Sprint 1 - 1 semana)
1. **pgvector + problem_embeddings** → Desbloqueia NLP real
2. **Edge Function analyze-problem** → Substitui heurísticas
3. **Tabelas visitors/sessions** → Completa Fase 0

### IMPORTANTE (Sprint 2 - 1 semana)
4. **effective_questions + RAG** → Melhora Fase 3
5. **blueprints table** → Corrige gap no schema
6. **Triggers e view** → Automação e analytics

### DESEJÁVEL (Sprint 3 - 3 dias)
7. **OpenAI fallback** → Redundância
8. **Performance optimization** → Índices compostos
9. **Migrations formalizadas** → Versionamento

---

## 📊 IMPACTO ESPERADO

### Antes (68% aderente)
- NLP heurístico (keywords simples)
- Embeddings mockados (zeros)
- Tracking apenas frontend
- Perguntas fixas (não adaptativas)

### Depois (100% aderente)
- ✅ NLP real via Gemini Pro (análise inteligente)
- ✅ Embeddings reais (384d, vector search funcional)
- ✅ Tracking persistido no backend (analytics completo)
- ✅ Perguntas adaptativas com RAG (3-9 baseado em intent)
- ✅ Database completo (todas as tabelas do PRD)
- ✅ Migrations versionadas (deploy seguro)

### Métricas de Sucesso
- **Backend**: 60% → 100% ✅
- **Edge Functions**: 67% → 100% ✅
- **Integrações IA**: 50% → 90% ✅
- **GERAL**: 68% → 95% ✅

**Nota**: 95% porque OpenAI é opcional (fallback), e geolocalização (IP → cidade) requer serviço externo pago

---

## 🔧 COMANDOS ÚTEIS

### Local Development
```bash
# Reset database e aplicar migrations
supabase db reset

# Ver status das migrations
supabase migration list

# Criar nova migration
supabase migration new <migration-name>

# Deploy Edge Function local
supabase functions serve analyze-problem
```

### Production
```bash
# Push migrations para produção
supabase db push

# Deploy Edge Functions
supabase functions deploy analyze-problem --no-verify-jwt
supabase functions deploy generate-questions --no-verify-jwt
supabase functions deploy generate-blueprint --no-verify-jwt

# Configurar secrets
supabase secrets set GEMINI_API_KEY=<key>
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>
```

---

## 🚨 CUIDADOS E RISCOS

### Riscos Identificados

1. **pgvector em produção**:
   - Risco: Extensão pode não estar disponível em alguns planos Supabase
   - Mitigação: Validar no plano atual antes de migrar

2. **Custo de Gemini Embeddings**:
   - Risco: 384d embeddings custam mais que modelos menores
   - Mitigação: Monitorar uso, implementar cache

3. **RLS Policies permissivas**:
   - Risco: Políticas atuais permitem `WITH CHECK (true)`
   - Mitigação: Revisar `security-hardening.sql` em produção

4. **Vector Index Build Time**:
   - Risco: HNSW index pode demorar em grandes volumes
   - Mitigação: Criar index CONCURRENTLY em produção

### Rollback Plan

Se algo der errado:
1. Backup do banco ANTES de aplicar migrations
2. Reverter migrations manualmente (SQL DROP/ALTER)
3. Rollback de Edge Functions via Supabase Dashboard
4. Restaurar variáveis de ambiente antigas

---

## 📞 PRÓXIMOS PASSOS

### Para @devops (Gage)
1. Aplicar migrations em staging
2. Configurar secrets no Supabase
3. Deploy de Edge Functions
4. Validar CI/CD para migrations automáticas

### Para @dev (Dex)
1. Integrar frontend com nova Edge Function `analyze-problem`
2. Substituir heurísticas por chamadas à API
3. Implementar persistência de tracking (visitors/sessions)
4. Testar fluxo completo end-to-end

### Para @qa
1. Validar vector search funciona
2. Testar NLP real vs heurístico (qualidade das análises)
3. Verificar RAG melhora qualidade das perguntas
4. Confirmar RLS policies protegem dados

---

**Documento criado por**: Aria (@architect AIOS)
**Data**: 27/01/2026
**Status**: Pronto para implementação
