// AI Processor - Handles AI response processing and analysis

export async function processAIResponse(response: string) {
  try {
    // Parse JSON response from AI
    const parsed = JSON.parse(response);
    return parsed;
  } catch (error) {
    console.error('Error processing AI response:', error);
    throw new Error('Failed to process AI response');
  }
}

export async function processProblemText(problemText: string, domain?: string) {
  // Process and analyze problem text from user input
  try {
    const trimmedText = problemText.trim();
    const length = trimmedText.length;

    // Simple domain detection based on keywords
    const detectedDomain =
      domain ||
      (trimmedText.toLowerCase().includes('entrega') || trimmedText.toLowerCase().includes('rota')
        ? 'logistics'
        : trimmedText.toLowerCase().includes('aduaneiro') || trimmedText.toLowerCase().includes('importação')
          ? 'comex'
          : 'technical');

    // Simple persona detection
    const detectedPersona =
      trimmedText.toLowerCase().includes('gerente') || trimmedText.toLowerCase().includes('lidar com a equipe')
        ? 'manager'
        : trimmedText.toLowerCase().includes('desenvolvedor') || trimmedText.toLowerCase().includes('codigo')
          ? 'developer'
          : 'other';

    // Calculate intent score based on text length and detail
    const intentScore = Math.min(100, Math.floor((length / 200) * 100));

    // Extract metadata
    const metadata = {
      urgencyLevel: trimmedText.toLowerCase().includes('urgente') ? 'high' : 'normal',
      hasProcessDescription: trimmedText.toLowerCase().includes('processo'),
      keywords: trimmedText.split(' ').filter(w => w.length > 5),
    };

    return {
      text: trimmedText,
      processedText: trimmedText,
      domain: detectedDomain,
      persona: detectedPersona,
      intentScore,
      metadata,
      timestamp: new Date().toISOString(),
      length,
    };
  } catch (error) {
    console.error('Error processing problem text:', error);
    throw new Error('Failed to process problem text');
  }
}

export function validateAIResponse(data: unknown): boolean {
  if (typeof data !== 'object' || data === null) {
    return false;
  }
  return true;
}
