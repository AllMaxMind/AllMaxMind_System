import jsPDF from 'jspdf';
import { Blueprint } from '../ai/blueprint';

interface PDFGeneratorOptions {
  filename?: string;
  companyName?: string;
  problemStatement?: string;
}

const DEFAULT_OPTIONS: PDFGeneratorOptions = {
  filename: 'blueprint-tecnico',
  companyName: 'All Max Mind',
};

export async function downloadBlueprintPDF(
  blueprint: Blueprint,
  options: PDFGeneratorOptions = {}
): Promise<void> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - 2 * margin;
    let yPos = margin;

    // Helper functions
    const addNewPageIfNeeded = (requiredSpace: number) => {
      if (yPos + requiredSpace > pageHeight - margin) {
        pdf.addPage();
        yPos = margin;
        return true;
      }
      return false;
    };

    const addSection = (title: string, items: string[], iconPrefix: string = '') => {
      addNewPageIfNeeded(40);

      // Section title
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229); // primary color
      pdf.text(title, margin, yPos);
      yPos += 8;

      // Section items
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);

      items.forEach((item) => {
        addNewPageIfNeeded(10);
        const bulletText = iconPrefix ? `${iconPrefix} ${item}` : `• ${item}`;
        const lines = pdf.splitTextToSize(bulletText, contentWidth - 5);
        pdf.text(lines, margin + 5, yPos);
        yPos += lines.length * 5 + 3;
      });

      yPos += 5;
    };

    // === HEADER ===
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 45, 'F');

    // Company name
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(12);
    pdf.setFont('helvetica', 'normal');
    pdf.text(opts.companyName!, margin, 15);

    // Blueprint title
    pdf.setFontSize(20);
    pdf.setFont('helvetica', 'bold');
    const titleLines = pdf.splitTextToSize(blueprint.title || 'Blueprint Tecnico', contentWidth);
    pdf.text(titleLines, margin, 28);

    // Date
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'normal');
    const dateStr = `Gerado em ${new Date().toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    })}`;
    pdf.text(dateStr, margin, 40);

    yPos = 55;

    // === EXECUTIVE SUMMARY ===
    addNewPageIfNeeded(30);
    pdf.setFontSize(14);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229);
    pdf.text('Resumo Executivo', margin, yPos);
    yPos += 8;

    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    const summaryLines = pdf.splitTextToSize(
      blueprint.executiveSummary || 'Resumo nao disponivel.',
      contentWidth
    );
    pdf.text(summaryLines, margin, yPos);
    yPos += summaryLines.length * 5 + 10;

    // === PROBLEM STATEMENT ===
    if (blueprint.problemStatement) {
      addNewPageIfNeeded(30);
      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text('Definicao do Problema', margin, yPos);
      yPos += 8;

      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');
      pdf.setTextColor(60, 60, 60);
      const problemLines = pdf.splitTextToSize(blueprint.problemStatement, contentWidth);
      pdf.text(problemLines, margin, yPos);
      yPos += problemLines.length * 5 + 10;
    }

    // === TIMELINE & INVESTMENT BOX ===
    addNewPageIfNeeded(35);

    // Box background
    pdf.setFillColor(248, 250, 252);
    pdf.roundedRect(margin, yPos, contentWidth, 25, 3, 3, 'F');

    // Timeline
    pdf.setFontSize(9);
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229);
    pdf.text('Estimativa Timeline:', margin + 5, yPos + 8);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(blueprint.timelineEstimate || 'A definir', margin + 45, yPos + 8);

    // Investment
    pdf.setFont('helvetica', 'bold');
    pdf.setTextColor(79, 70, 229);
    pdf.text('Investimento Estimado:', margin + 5, yPos + 18);
    pdf.setFont('helvetica', 'normal');
    pdf.setTextColor(60, 60, 60);
    pdf.text(blueprint.estimatedInvestment || 'Sob consulta', margin + 50, yPos + 18);

    yPos += 35;

    // === OBJECTIVES ===
    if (blueprint.objectives?.length) {
      addSection('Objetivos Estrategicos', blueprint.objectives, '✓');
    }

    // === TECHNICAL ARCHITECTURE ===
    if (blueprint.technicalArchitecture?.length) {
      addSection('Arquitetura Tecnica', blueprint.technicalArchitecture, '→');
    }

    // === KEY FEATURES ===
    if (blueprint.keyFeatures?.length) {
      addSection('Funcionalidades Chave', blueprint.keyFeatures, '•');
    }

    // === SUCCESS METRICS ===
    if (blueprint.successMetrics?.length) {
      addSection('Metricas de Sucesso', blueprint.successMetrics, '📊');
    }

    // === RISKS ===
    if (blueprint.risksAndMitigations?.length) {
      addSection('Riscos e Mitigacoes', blueprint.risksAndMitigations, '⚠');
    }

    // === NEXT STEPS ===
    if (blueprint.nextSteps?.length) {
      addNewPageIfNeeded(40);

      pdf.setFontSize(14);
      pdf.setFont('helvetica', 'bold');
      pdf.setTextColor(79, 70, 229);
      pdf.text('Proximos Passos', margin, yPos);
      yPos += 10;

      blueprint.nextSteps.forEach((step, index) => {
        addNewPageIfNeeded(15);

        // Step number circle (simulated)
        pdf.setFillColor(79, 70, 229);
        pdf.circle(margin + 5, yPos - 1.5, 4, 'F');
        pdf.setTextColor(255, 255, 255);
        pdf.setFontSize(8);
        pdf.setFont('helvetica', 'bold');
        pdf.text(String(index + 1), margin + 3.5, yPos);

        // Step text
        pdf.setTextColor(60, 60, 60);
        pdf.setFontSize(10);
        pdf.setFont('helvetica', 'normal');
        const stepLines = pdf.splitTextToSize(step, contentWidth - 15);
        pdf.text(stepLines, margin + 15, yPos);
        yPos += stepLines.length * 5 + 5;
      });
    }

    // === FOOTER ===
    const addFooter = (pageNum: number, totalPages: number) => {
      pdf.setFontSize(8);
      pdf.setTextColor(150, 150, 150);
      pdf.setFont('helvetica', 'normal');

      // Disclaimer
      pdf.text(
        'Este blueprint e uma estimativa preliminar sujeita a alinhamento tecnico.',
        margin,
        pageHeight - 15
      );

      // Page number
      pdf.text(
        `Pagina ${pageNum} de ${totalPages}`,
        pageWidth - margin - 20,
        pageHeight - 15
      );

      // Company
      pdf.text(
        `${opts.companyName} - Blueprint Tecnico`,
        pageWidth / 2 - 25,
        pageHeight - 10
      );
    };

    // Add footers to all pages
    const totalPages = pdf.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      pdf.setPage(i);
      addFooter(i, totalPages);
    }

    // Generate filename
    const timestamp = new Date().toISOString().split('T')[0];
    const safeTitle = (blueprint.title || 'blueprint')
      .toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30);
    const finalFilename = `${opts.filename}-${safeTitle}-${timestamp}.pdf`;

    // Download
    pdf.save(finalFilename);

    console.log('[PDF] Blueprint downloaded successfully:', finalFilename);
    return;
  } catch (error) {
    console.error('[PDF] Error generating blueprint PDF:', error);
    throw new Error('Falha ao gerar o PDF. Por favor, tente novamente.');
  }
}

export async function generateBlueprintPDFBlob(
  blueprint: Blueprint,
  options: PDFGeneratorOptions = {}
): Promise<Blob> {
  const opts = { ...DEFAULT_OPTIONS, ...options };

  try {
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    // Same content generation as above...
    // For now, simplified version
    const pageWidth = pdf.internal.pageSize.getWidth();
    const margin = 20;
    let yPos = margin;

    // Header
    pdf.setFillColor(79, 70, 229);
    pdf.rect(0, 0, pageWidth, 40, 'F');
    pdf.setTextColor(255, 255, 255);
    pdf.setFontSize(18);
    pdf.setFont('helvetica', 'bold');
    pdf.text(blueprint.title || 'Blueprint Tecnico', margin, 25);

    yPos = 50;

    // Executive Summary
    pdf.setTextColor(60, 60, 60);
    pdf.setFontSize(10);
    pdf.setFont('helvetica', 'normal');
    const lines = pdf.splitTextToSize(blueprint.executiveSummary || '', pageWidth - 2 * margin);
    pdf.text(lines, margin, yPos);

    return pdf.output('blob');
  } catch (error) {
    console.error('[PDF] Error generating blueprint PDF blob:', error);
    throw new Error('Falha ao gerar o PDF.');
  }
}

/**
 * Validate blueprint content for PDF generation
 * Checks that all required fields are present
 */
export function validateBlueprintContent(content: any): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Required fields
  if (!content.title || typeof content.title !== 'string') {
    errors.push('Blueprint title is required');
  }

  if (!content.executiveSummary || typeof content.executiveSummary !== 'string') {
    errors.push('Executive summary is required');
  }

  if (!content.problemStatement || typeof content.problemStatement !== 'string') {
    errors.push('Problem statement is required');
  }

  if (!Array.isArray(content.architectureLayers) || content.architectureLayers.length === 0) {
    errors.push('At least one architecture layer is required');
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
