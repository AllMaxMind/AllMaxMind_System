
-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- 1. Tabela de Problemas (Phase 1)
create table if not exists problems (
  id uuid default uuid_generate_v4() primary key,
  visitor_id text,
  session_id text,
  raw_text text not null,
  processed_text text,
  domain text,
  persona text,
  intent_score numeric,
  metadata jsonb,
  final_complexity text,
  analysis_completed boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Tabela de Dimensões (Phase 2)
create table if not exists dimensions (
  id uuid default uuid_generate_v4() primary key,
  problem_id uuid references problems(id) on delete cascade,
  dimension_id text not null,
  option_id text not null,
  impact_score numeric,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Tabela de Perguntas e Respostas (Phase 3)
create table if not exists questions_answers (
  id uuid default uuid_generate_v4() primary key,
  problem_id uuid references problems(id) on delete cascade,
  question_type text,
  question text not null,
  answer text not null,
  complexity_score numeric,
  is_critical boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Tabela de Leads (Phase 4)
create table if not exists leads (
  id uuid default uuid_generate_v4() primary key,
  blueprint_id text,
  user_email text not null,
  user_name text,
  company_name text,
  phone text,
  job_title text,
  contact_preference text,
  lead_status text default 'new',
  lead_score numeric,
  project_size_estimated text,
  project_timeline_estimated numeric,
  source text,
  campaign text,
  accept_marketing boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Configurar RLS (Row Level Security) para permitir inserts anônimos
alter table problems enable row level security;
alter table dimensions enable row level security;
alter table questions_answers enable row level security;
alter table leads enable row level security;

-- Políticas para permitir inserção pública (para o fluxo de onboarding)
create policy "Allow public insert problems" on problems for insert with check (true);
create policy "Allow public select problems" on problems for select using (true); -- Em prod, restringir por session_id
create policy "Allow public update problems" on problems for update using (true);

create policy "Allow public insert dimensions" on dimensions for insert with check (true);
create policy "Allow public select dimensions" on dimensions for select using (true);

create policy "Allow public insert answers" on questions_answers for insert with check (true);
create policy "Allow public select answers" on questions_answers for select using (true);

create policy "Allow public insert leads" on leads for insert with check (true);
