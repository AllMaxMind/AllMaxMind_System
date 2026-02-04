# Story SPRINT-3.4: Implementar Download PDF do Blueprint

**Sprint:** 3 - Funcionalidade Core
**Prioridade:** ALTA
**Owner:** @dev
**Status:** [ ] Pendente

---

## Objetivo

Permitir que usuarios facam download do blueprint em formato PDF, conforme especificado no PRD: "Blueprint tecnico (download)".

---

## Contexto

**Requisito PRD:**
> Entrega Imediata: Blueprint tecnico completo (PDF download)

**Estado Atual:** Nao existe funcionalidade de download PDF. Usuario so ve o blueprint na tela.

---

## Criterios de Aceite

- [ ] Botao "Baixar PDF" visivel apos captura do lead
- [ ] PDF gerado com todos os dados do blueprint
- [ ] PDF com branding All Max Mind (logo, cores)
- [ ] PDF responsivo (A4)
- [ ] Nome do arquivo: `Blueprint_[ProjectTitle]_[Date].pdf`
- [ ] PDF tambem enviado por email (integracao com Story 3.1)

---

## Tasks

### Task 3.4.1 - Instalar Dependencia PDF
- [ ] Adicionar `@react-pdf/renderer` ou `jspdf` + `html2canvas`
- [ ] Testar geracao basica

**Recomendacao:** Usar `@react-pdf/renderer` para melhor controle de layout.

```bash
npm install @react-pdf/renderer
```

### Task 3.4.2 - Criar Componente PDF
- [ ] Template PDF com todas secoes do blueprint
- [ ] Estilizacao com branding
- [ ] Header com logo
- [ ] Footer com contato

**Arquivo Novo:** `lib/pdf/BlueprintPDF.tsx`

### Task 3.4.3 - Implementar Funcao de Download
- [ ] Gerar blob do PDF
- [ ] Trigger de download
- [ ] Loading state durante geracao

**Arquivo Novo:** `lib/pdf/downloadBlueprint.ts`

### Task 3.4.4 - Adicionar Botao no Phase4
- [ ] Botao visivel apos lead capture
- [ ] Icone de download
- [ ] Feedback de sucesso

**Arquivo:** `src/components/phases/Phase4.tsx`

### Task 3.4.5 - Enviar PDF por Email
- [ ] Gerar PDF em base64
- [ ] Anexar ao email de blueprint_delivery
- [ ] Ou enviar link para download

---

## Especificacao Tecnica

### Template PDF com @react-pdf/renderer

```typescript
// lib/pdf/BlueprintPDF.tsx
import React from 'react'
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
  Font,
} from '@react-pdf/renderer'
import { Blueprint } from '../ai/blueprint'

// Registrar fonte (opcional)
Font.register({
  family: 'Inter',
  src: 'https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2'
})

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: 'Inter',
    fontSize: 11,
    color: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 30,
    paddingBottom: 20,
    borderBottomWidth: 2,
    borderBottomColor: '#14b8a6',
  },
  logo: {
    width: 120,
    height: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#14b8a6',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 20,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#0f172a',
    marginBottom: 10,
    paddingBottom: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  text: {
    fontSize: 11,
    lineHeight: 1.6,
    color: '#334155',
  },
  listItem: {
    flexDirection: 'row',
    marginBottom: 6,
  },
  bullet: {
    width: 15,
    color: '#14b8a6',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridItem: {
    width: '48%',
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
  },
  metricLabel: {
    fontSize: 10,
    color: '#64748b',
    marginBottom: 4,
  },
  metricValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#14b8a6',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    color: '#94a3b8',
    fontSize: 9,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  tag: {
    backgroundColor: '#14b8a6',
    color: '#fff',
    padding: '4 8',
    borderRadius: 4,
    marginRight: 6,
    marginBottom: 6,
    fontSize: 10,
  },
  disclaimer: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#fef3c7',
    borderRadius: 8,
  },
  disclaimerText: {
    fontSize: 9,
    color: '#92400e',
  },
})

interface BlueprintPDFProps {
  blueprint: Blueprint
  leadName?: string
  companyName?: string
}

export const BlueprintPDF: React.FC<BlueprintPDFProps> = ({
  blueprint,
  leadName,
  companyName
}) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#14b8a6' }}>
            All Max Mind
          </Text>
          <Text style={{ fontSize: 9, color: '#64748b' }}>
            Fast Soft-House AI-Driven
          </Text>
        </View>
        <View style={{ textAlign: 'right' }}>
          <Text style={{ fontSize: 9, color: '#64748b' }}>
            Gerado em: {new Date().toLocaleDateString('pt-BR')}
          </Text>
          {companyName && (
            <Text style={{ fontSize: 9, color: '#64748b' }}>
              Para: {companyName}
            </Text>
          )}
        </View>
      </View>

      {/* Title */}
      <Text style={styles.title}>{blueprint.title}</Text>
      <Text style={styles.subtitle}>
        Blueprint Tecnico | Complexidade: {
          blueprint.projectSize === 'small' ? 'Pequeno' :
          blueprint.projectSize === 'medium' ? 'Medio' : 'Grande'
        }
      </Text>

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Resumo Executivo</Text>
        <Text style={styles.text}>{blueprint.executiveSummary}</Text>
      </View>

      {/* Metrics Grid */}
      <View style={[styles.section, styles.grid]}>
        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>Timeline Estimado</Text>
          <Text style={styles.metricValue}>{blueprint.timelineEstimate}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.metricLabel}>Investimento</Text>
          <Text style={styles.metricValue}>{blueprint.estimatedInvestment}</Text>
        </View>
      </View>

      {/* Problem Statement */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Definicao do Problema</Text>
        <Text style={styles.text}>{blueprint.problemStatement}</Text>
      </View>

      {/* Objectives */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Objetivos Estrategicos</Text>
        {blueprint.objectives.map((obj, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{obj}</Text>
          </View>
        ))}
      </View>

      {/* Tech Stack */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Arquitetura Tecnica</Text>
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {blueprint.technicalArchitecture.map((tech, i) => (
            <Text key={i} style={styles.tag}>{tech}</Text>
          ))}
        </View>
      </View>

      {/* Key Features */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Funcionalidades Chave</Text>
        {blueprint.keyFeatures.map((feat, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>•</Text>
            <Text style={styles.text}>{feat}</Text>
          </View>
        ))}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⚠️ IMPORTANTE: Esta estimativa e preliminar e pode ser ajustada apos a reuniao
          de alinhamento tecnico. A definicao final de escopo, funcionalidades e prazos
          sera validada em conjunto com nossa equipe.
        </Text>
      </View>

      {/* Footer */}
      <Text style={styles.footer}>
        All Max Mind | contato@allmaxmind.com | allmaxmind.com
        {'\n'}ID: {blueprint.id}
      </Text>
    </Page>

    {/* Page 2 - Details */}
    <Page size="A4" style={styles.page}>
      {/* Success Metrics */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Metricas de Sucesso</Text>
        {blueprint.successMetrics.map((metric, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>✓</Text>
            <Text style={styles.text}>{metric}</Text>
          </View>
        ))}
      </View>

      {/* Risks */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Riscos e Mitigacoes</Text>
        {blueprint.risksAndMitigations.map((risk, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={styles.bullet}>⚡</Text>
            <Text style={styles.text}>{risk}</Text>
          </View>
        ))}
      </View>

      {/* Next Steps */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Proximos Passos</Text>
        {blueprint.nextSteps.map((step, i) => (
          <View key={i} style={styles.listItem}>
            <Text style={[styles.bullet, { color: '#14b8a6', fontWeight: 'bold' }]}>
              {i + 1}.
            </Text>
            <Text style={styles.text}>{step}</Text>
          </View>
        ))}
      </View>

      {/* CTA */}
      <View style={{
        marginTop: 30,
        padding: 20,
        backgroundColor: '#0f766e',
        borderRadius: 8,
      }}>
        <Text style={{ color: '#fff', fontWeight: 'bold', marginBottom: 8 }}>
          Pronto para comecar?
        </Text>
        <Text style={{ color: '#99f6e4', fontSize: 10, lineHeight: 1.6 }}>
          Entre em contato para agendar uma reuniao de alinhamento tecnico.
          Oferecemos prototipo navegavel em 7 dias uteis.
        </Text>
        <Text style={{ color: '#fff', marginTop: 10, fontSize: 12 }}>
          WhatsApp: (11) 99999-9999 | Email: contato@allmaxmind.com
        </Text>
      </View>

      <Text style={styles.footer}>
        All Max Mind | contato@allmaxmind.com | allmaxmind.com
      </Text>
    </Page>
  </Document>
)
```

### Funcao de Download

```typescript
// lib/pdf/downloadBlueprint.ts
import { pdf } from '@react-pdf/renderer'
import { BlueprintPDF } from './BlueprintPDF'
import { Blueprint } from '../ai/blueprint'

export async function downloadBlueprintPDF(
  blueprint: Blueprint,
  leadName?: string,
  companyName?: string
): Promise<void> {
  // Gerar PDF
  const blob = await pdf(
    <BlueprintPDF
      blueprint={blueprint}
      leadName={leadName}
      companyName={companyName}
    />
  ).toBlob()

  // Criar URL e trigger download
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')

  // Nome do arquivo
  const sanitizedTitle = blueprint.title
    .replace(/[^a-zA-Z0-9]/g, '_')
    .substring(0, 50)
  const date = new Date().toISOString().split('T')[0]
  link.download = `Blueprint_${sanitizedTitle}_${date}.pdf`

  link.href = url
  document.body.appendChild(link)
  link.click()
  document.body.removeChild(link)

  // Cleanup
  URL.revokeObjectURL(url)
}

// Para enviar por email (retorna base64)
export async function generateBlueprintPDFBase64(
  blueprint: Blueprint,
  leadName?: string,
  companyName?: string
): Promise<string> {
  const blob = await pdf(
    <BlueprintPDF
      blueprint={blueprint}
      leadName={leadName}
      companyName={companyName}
    />
  ).toBlob()

  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onloadend = () => {
      const base64 = (reader.result as string).split(',')[1]
      resolve(base64)
    }
    reader.onerror = reject
    reader.readAsDataURL(blob)
  })
}
```

### Botao no Phase4

```typescript
// src/components/phases/Phase4.tsx

import { downloadBlueprintPDF } from '../../lib/pdf/downloadBlueprint'

// Estado
const [isDownloading, setIsDownloading] = useState(false)

// Handler
const handleDownloadPDF = async () => {
  if (!generatedBlueprint) return

  setIsDownloading(true)
  try {
    await downloadBlueprintPDF(
      generatedBlueprint,
      leadForm.name,
      leadForm.company
    )
    toast.success('PDF baixado com sucesso!')

    analytics.trackEvent('blueprint_downloaded', {
      blueprint_id: generatedBlueprint.id,
      complexity: complexity
    })
  } catch (error) {
    console.error('[Phase4] PDF download error:', error)
    toast.error('Erro ao gerar PDF. Tente novamente.')
  } finally {
    setIsDownloading(false)
  }
}

// JSX - Adicionar apos showFullBlueprint
{showFullBlueprint && generatedBlueprint && (
  <div className="mt-6 flex justify-center">
    <button
      onClick={handleDownloadPDF}
      disabled={isDownloading}
      className="btn-primary flex items-center gap-2 px-8"
    >
      {isDownloading ? (
        <>
          <LoadingSpinner size="sm" />
          Gerando PDF...
        </>
      ) : (
        <>
          <Download className="w-5 h-5" />
          Baixar Blueprint em PDF
        </>
      )}
    </button>
  </div>
)}
```

---

## Dependencias

```json
{
  "dependencies": {
    "@react-pdf/renderer": "^3.1.0"
  }
}
```

---

## Checklist Final

- [ ] Dependencia instalada
- [ ] Componente PDF criado
- [ ] Funcao de download implementada
- [ ] Botao adicionado no Phase4
- [ ] PDF gerado corretamente com todos dados
- [ ] Nome do arquivo correto
- [ ] Tracking de analytics
- [ ] Integracao com email (base64)
- [ ] Testes em diferentes browsers

---

*Story criada por @architect (Aria) - Sprint 3*
