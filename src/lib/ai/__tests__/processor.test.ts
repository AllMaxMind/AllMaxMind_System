import { describe, it, expect } from 'vitest';
import { processProblemText } from '../processor';

describe('AI Text Processor', () => {
  it('should identify Logistics domain correctly', async () => {
    const text = "Precisamos melhorar a rota de entrega dos caminhões e reduzir o custo do frete.";
    const result = await processProblemText(text);
    
    expect(result.domain).toBe('logistics');
    expect(result.processedText).toBe(text);
  });

  it('should identify COMEX domain correctly', async () => {
    const text = "Atraso no desembaraço aduaneiro e cálculo errado de impostos de importação.";
    const result = await processProblemText(text);
    
    expect(result.domain).toBe('comex');
  });

  it('should detect Manager persona', async () => {
    const text = "Como gerente de logística, preciso liderar a equipe para bater as metas.";
    const result = await processProblemText(text);
    
    expect(result.persona).toBe('manager');
  });

  it('should calculate intent score based on detail level', async () => {
    const shortText = "Problema no frete.";
    const longText = "Estamos com um problema complexo no processo de frete que envolve atrasos de 3 dias, custos extras de R$ 5000 e falta de visibilidade para o cliente final. Precisamos resolver isso agora.";
    
    const resultShort = await processProblemText(shortText);
    const resultLong = await processProblemText(longText);
    
    expect(resultLong.intentScore).toBeGreaterThan(resultShort.intentScore);
  });

  it('should extract metadata correctly', async () => {
    const text = "Urgente: o processo manual está causando erros de digitação.";
    const result = await processProblemText(text);
    
    expect(result.metadata.urgencyLevel).toBe('high'); // "Urgente" keyword
    expect(result.metadata.hasProcessDescription).toBe(true); // "processo" keyword
  });
});