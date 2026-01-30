# Story SPRINT-3.2: Implementar Autenticacao Funcional

**Sprint:** 3 - Funcionalidade Core
**Prioridade:** CRITICA
**Owner:** @dev
**Status:** [x] Em Progresso

---

## Objetivo

Implementar autenticacao real com Google OAuth e Magic Link, substituindo o stub atual que apenas exibe uma mensagem de "ambiente demo".

---

## Contexto

**Problema Atual:**
O arquivo `src/components/phases/Phase4.tsx:185-213` contem um stub:

```typescript
const handleLogin = async (method: 'google' | 'email') => {
  if (!supabase.auth) {
    toast.info("Autenticacao nao configurada neste ambiente de demo.");
    return;  // <-- NAO FAZ NADA
  }
  // ...
}
```

**Impacto:** Usuarios NAO conseguem fazer login, o PRD exige login obrigatorio para download do blueprint.

---

## Criterios de Aceite

- [ ] Login com Google OAuth funcional (redirect + callback)
- [ ] Login com Magic Link funcional (email enviado + redirect)
- [ ] Sessao persistida apos login
- [ ] Usuario autenticado vinculado ao lead
- [ ] Pagina de callback `/callback` implementada
- [ ] Logout funcional
- [ ] Protecao de rotas (blueprint so acessivel apos auth)
- [ ] Tratamento de erros de autenticacao

---

## Tasks

### Task 3.2.1 - Configurar Supabase Auth
- [ ] Habilitar Google OAuth no Supabase Dashboard
- [ ] Configurar credenciais Google Cloud Console
- [ ] Habilitar Email/Magic Link no Supabase
- [ ] Configurar URL de redirect

**Dashboard:** https://supabase.com/dashboard/project/[PROJECT_ID]/auth/providers

### Task 3.2.2 - Criar Pagina de Callback
- [x] Criar componente `AuthCallback.tsx` (integrado no AuthContext)
- [x] Adicionar rota `/callback` no router (usa URL hash, nao precisa rota separada)
- [x] Processar tokens da URL (AuthContext processa hash automaticamente)
- [x] Redirecionar para blueprint apos sucesso

**Arquivo Novo:** `src/pages/AuthCallback.tsx`

### Task 3.2.3 - Refatorar handleLogin no Phase4
- [x] Remover verificacao de stub
- [x] Implementar fluxo real de OAuth (via useAuth hook)
- [x] Implementar fluxo real de Magic Link (via useAuth hook)
- [x] Adicionar loading states (isLoggingIn state)

**Arquivo:** `src/components/phases/Phase4.tsx`

### Task 3.2.4 - Implementar Auth Context
- [x] Criar AuthProvider com estado global
- [x] Hook useAuth para componentes
- [x] Persistencia de sessao (via Supabase)
- [x] Auto-refresh de tokens (via Supabase)

**Arquivo Novo:** `src/contexts/AuthContext.tsx`

### Task 3.2.5 - Vincular Usuario ao Lead
- [x] Atualizar lead com user_id apos login (linkUserToLeads no AuthContext)
- [x] Migration criada: 00011_add_user_id_to_leads.sql
- [ ] Buscar leads anteriores do usuario (futuro - dashboard)
- [ ] Mostrar historico de blueprints (futuro - dashboard)

---

## Especificacao Tecnica

### Configuracao Google OAuth (Supabase Dashboard)

```
Provider: Google
Client ID: [Do Google Cloud Console]
Client Secret: [Do Google Cloud Console]
Redirect URL: https://[PROJECT_REF].supabase.co/auth/v1/callback
```

### AuthContext

```typescript
// src/contexts/AuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { supabase } from '../lib/supabaseClient'
import { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signInWithGoogle: () => Promise<void>
  signInWithMagicLink: (email: string) => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Verificar sessao existente
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Escutar mudancas de auth
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setSession(session)
        setUser(session?.user ?? null)
        setLoading(false)

        if (event === 'SIGNED_IN' && session?.user) {
          // Vincular usuario a leads existentes
          await linkUserToLeads(session.user.id, session.user.email)
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/callback`,
        queryParams: {
          access_type: 'offline',
          prompt: 'consent',
        }
      }
    })
    if (error) throw error
  }

  const signInWithMagicLink = async (email: string) => {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/callback`,
      }
    })
    if (error) throw error
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      signInWithGoogle,
      signInWithMagicLink,
      signOut
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

async function linkUserToLeads(userId: string, email: string | undefined) {
  if (!email) return

  // Vincular leads existentes ao usuario
  await supabase
    .from('leads')
    .update({ user_id: userId })
    .eq('user_email', email)
    .is('user_id', null)
}
```

### Pagina de Callback

```typescript
// src/pages/AuthCallback.tsx
import React, { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { supabase } from '../lib/supabaseClient'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const AuthCallback: React.FC = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const handleCallback = async () => {
      try {
        // Supabase processa os tokens automaticamente da URL
        const { data: { session }, error } = await supabase.auth.getSession()

        if (error) throw error

        if (session) {
          // Sucesso - redirecionar para a pagina anterior ou home
          const returnTo = localStorage.getItem('auth_return_to') || '/'
          localStorage.removeItem('auth_return_to')
          navigate(returnTo, { replace: true })
        } else {
          throw new Error('Sessao nao encontrada')
        }
      } catch (err: any) {
        console.error('[AuthCallback] Error:', err)
        setError(err.message || 'Erro na autenticacao')
      }
    }

    handleCallback()
  }, [navigate])

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-ds-bg">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-ds-error mb-4">Erro na Autenticacao</h1>
          <p className="text-ds-text-secondary mb-6">{error}</p>
          <button
            onClick={() => navigate('/')}
            className="btn-primary"
          >
            Voltar ao Inicio
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-ds-bg">
      <div className="text-center">
        <LoadingSpinner size="lg" />
        <p className="text-ds-text-secondary mt-4">Autenticando...</p>
      </div>
    </div>
  )
}

export default AuthCallback
```

### Refatoracao do Phase4 handleLogin

```typescript
// src/components/phases/Phase4.tsx - Refatorar handleLogin

import { useAuth } from '../../contexts/AuthContext'

// Dentro do componente:
const { signInWithGoogle, signInWithMagicLink } = useAuth()

const handleLogin = async (method: 'google' | 'email') => {
  try {
    // Salvar URL de retorno
    localStorage.setItem('auth_return_to', window.location.pathname)

    if (method === 'google') {
      await signInWithGoogle()
      // Redirect acontece automaticamente
    } else {
      if (!leadForm.email) {
        toast.error('Preencha seu email primeiro')
        return
      }
      await signInWithMagicLink(leadForm.email)
      toast.success('Link de acesso enviado! Verifique seu email.')
    }
  } catch (error: any) {
    console.error('[Phase4] Login error:', error)
    toast.error(error.message || 'Erro no login. Tente novamente.')
  }
}
```

### Adicionar Rota no Router

```typescript
// src/App.tsx ou router.tsx
import AuthCallback from './pages/AuthCallback'

// Adicionar rota:
<Route path="/callback" element={<AuthCallback />} />
```

---

## Dependencias

- **@devops** deve configurar:
  - Google Cloud Console OAuth credentials
  - Supabase Auth providers habilitados
  - URLs de redirect configuradas

---

## Migracao de Schema

Adicionar coluna `user_id` na tabela leads se nao existir:

```sql
-- supabase/migrations/00011_add_user_id_to_leads.sql
ALTER TABLE leads
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES auth.users(id);

CREATE INDEX IF NOT EXISTS idx_leads_user_id ON leads(user_id);
```

---

## Fluxo de Autenticacao

```
┌─────────────┐     ┌─────────────┐     ┌─────────────┐
│   Phase4    │────▶│   Google    │────▶│  Callback   │
│  (Login)    │     │   OAuth     │     │   Page      │
└─────────────┘     └─────────────┘     └──────┬──────┘
                                               │
                    ┌─────────────┐            │
                    │  Blueprint  │◀───────────┘
                    │  Unlocked   │
                    └─────────────┘
```

---

## Checklist Final

- [ ] Google OAuth configurado no Supabase
- [ ] Magic Link habilitado
- [ ] AuthContext implementado
- [ ] Pagina /callback funcionando
- [ ] handleLogin refatorado
- [ ] Usuario vinculado ao lead
- [ ] Migracao de schema aplicada
- [ ] Testes em staging
- [ ] Validacao @qa

---

*Story criada por @architect (Aria) - Sprint 3*
