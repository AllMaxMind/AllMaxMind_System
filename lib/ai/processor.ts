// Processamento básico de texto para inferir domínio e persona
export interface ProblemAnalysis {
  processedText: string;
  domain: 'logistics' | 'supply_chain' | 'comex' | 'procurement' | 'finance' | 'other';
  persona: 'operator' | 'manager' | 'director' | 'analyst' | 'other';
  intentScore: number; // 0-100
  metadata: {
    keywords: string[];
    hasNumbers: boolean;
    hasProcessDescription: boolean;
    emotionalTone: 'frustrated' | 'neutral' | 'optimistic';
    urgencyLevel: 'low' | 'medium' | 'high';
  };
  processingTime: number;
}

export const processProblemText = async (text: string): Promise<ProblemAnalysis> => {
  const startTime = Date.now();
  
  // Normalização do texto
  const normalizedText = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim();

  // Keywords por domínio
  const domainKeywords = {
    logistics: ['frete', 'transporte', 'entreg', 'distribui', 'rota', 'caminhão', 'motorista', 'logistica'],
    supply_chain: ['estoque', 'armaz', 'supply chain', 'cadeia', 'fornecedor', 'lead time', 'suprimentos'],
    comex: ['import', 'export', 'aduane', 'despach', 'imposto', 'ii', 'ipi', 'icms', 'comex', 'siscomex'],
    procurement: ['compra', 'cotação', 'fornecedor', 'negocia', 'aquisição', 'licitação', 'sourcing'],
    finance: ['custo', 'orcamento', 'fluxo', 'caixa', 'contabil', 'financeir', 'taxa', 'juros', 'pagamento']
  };

  // Identificar domínio
  let domain: ProblemAnalysis['domain'] = 'other';
  let domainScore = 0;

  Object.entries(domainKeywords).forEach(([dom, keywords]) => {
    const score = keywords.filter(keyword => 
      normalizedText.includes(keyword)
    ).length;
    
    if (score > domainScore) {
      domainScore = score;
      domain = dom as ProblemAnalysis['domain'];
    }
  });

  // Identificar persona
  let persona: ProblemAnalysis['persona'] = 'other';
  const personaIndicators = {
    operator: ['execut', 'opera', 'digit', 'lança', 'preench', 'planilha', 'manual'],
    manager: ['gerente', 'coorden', 'supervis', 'lider', 'equipe', 'gestão'],
    director: ['diretor', 'presidente', 'vp', 'c-level', 'estratég', 'visão'],
    analyst: ['analista', 'controlador', 'financeir', 'relatóri', 'dados', 'kpi']
  };

  Object.entries(personaIndicators).forEach(([pers, indicators]) => {
    if (indicators.some(indicator => normalizedText.includes(indicator))) {
      persona = pers as ProblemAnalysis['persona'];
    }
  });

  // Calcular intent score baseado em:
  // 1. Comprimento do texto (0-30 pontos)
  // 2. Especificidade (presença de números, processos) (0-40 pontos)
  // 3. Clareza do problema (0-30 pontos)
  const lengthScore = Math.min(text.length / 10, 30);
  const hasNumbers = /\d+/.test(text) ? 20 : 0;
  const hasProcess = text.includes('processo') || text.includes('como') || text.includes('atual') ? 20 : 0;
  const clarityKeywords = ['problema', 'dor', 'dificuldade', 'atraso', 'erro', 'custo', 'falha', 'gargalo'];
  const clarityScore = Math.min(clarityKeywords.filter(kw => text.toLowerCase().includes(kw)).length * 5, 30);
  
  const intentScore = Math.min(lengthScore + hasNumbers + hasProcess + clarityScore, 100);

  // Analisar tom emocional
  const emotionalKeywords = {
    frustrated: ['problema', 'erro', 'atraso', 'custo', 'difícil', 'complicado', 'sofrendo', 'ruim', 'caos'],
    optimistic: ['ideal', 'gostaria', 'melhorar', 'automatizar', 'solução', 'otimizar', 'rápido', 'eficiente']
  };
  
  let emotionalTone: ProblemAnalysis['metadata']['emotionalTone'] = 'neutral';
  const frustratedCount = emotionalKeywords.frustrated.filter(kw => text.toLowerCase().includes(kw)).length;
  const optimisticCount = emotionalKeywords.optimistic.filter(kw => text.toLowerCase().includes(kw)).length;
  
  if (frustratedCount > optimisticCount + 1) emotionalTone = 'frustrated';
  else if (optimisticCount > frustratedCount + 1) emotionalTone = 'optimistic';

  // Nível de urgência
  const urgencyKeywords = ['urgent', 'imediat', 'rápido', 'agora', 'hoje', 'prazo curto', 'ontem', 'crítico'];
  const urgencyCount = urgencyKeywords.filter(kw => text.toLowerCase().includes(kw)).length;
  const urgencyLevel: ProblemAnalysis['metadata']['urgencyLevel'] = 
    urgencyCount > 2 ? 'high' : urgencyCount > 0 ? 'medium' : 'low';

  // Extrair keywords
  const stopWords = ['o', 'a', 'os', 'as', 'de', 'do', 'da', 'dos', 'das', 'em', 'no', 'na', 'nos', 'nas', 'por', 'para', 'com', 'que', 'uma', 'um', 'e', 'é'];
  const words = normalizedText
    .split(/\s+/)
    .filter(word => word.length > 3 && !stopWords.includes(word));
  
  const keywordCounts: Record<string, number> = {};
  words.forEach(word => {
    keywordCounts[word] = (keywordCounts[word] || 0) + 1;
  });
  
  const keywords = Object.entries(keywordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);

  return {
    processedText: text,
    domain,
    persona,
    intentScore,
    metadata: {
      keywords,
      hasNumbers: /\d+/.test(text),
      hasProcessDescription: text.includes('processo') || text.includes('como faz'),
      emotionalTone,
      urgencyLevel
    },
    processingTime: Date.now() - startTime
  };
};