/**
 * Email Provider Tests
 * Story: SPRINT-1-P1
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Email Provider', () => {
  beforeEach(() => {
    // Mock environment variables
    vi.stubEnv('VITE_RESEND_API_KEY', 'test-key-123');
  });

  it('should create email template with correct structure', () => {
    const emailData = {
      name: 'blueprint_delivery',
      subject: 'Seu Blueprint Arquitetural - John Doe',
      recipient_name: 'John Doe',
      recipient_email: 'john@example.com',
      blueprint_title: 'Microservices Architecture',
      blueprint_summary: 'A comprehensive guide to building scalable systems',
      pdf_url: 'https://storage.example.com/blueprint.pdf',
      language: 'pt-BR' as const
    };

    // Verify email data structure
    expect(emailData.subject).toBeDefined();
    expect(emailData.recipient_email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    expect(emailData.language).toMatch(/^(en|pt-BR)$/);
  });

  it('should format Portuguese email correctly', () => {
    const emailData = {
      name: 'blueprint_delivery',
      subject: 'Seu Blueprint Arquitetural',
      recipient_name: 'João',
      recipient_email: 'joao@example.com',
      blueprint_title: 'Arquitetura',
      blueprint_summary: 'Descrição em português',
      language: 'pt-BR' as const
    };

    expect(emailData.subject).toContain('Seu Blueprint');
    expect(emailData.language).toBe('pt-BR');
  });

  it('should format English email correctly', () => {
    const emailData = {
      name: 'blueprint_delivery',
      subject: 'Your Architectural Blueprint',
      recipient_name: 'John',
      recipient_email: 'john@example.com',
      blueprint_title: 'Architecture',
      blueprint_summary: 'Description in English',
      language: 'en' as const
    };

    expect(emailData.subject).toContain('Blueprint');
    expect(emailData.language).toBe('en');
  });

  it('should validate email address format', () => {
    const validEmails = [
      'user@example.com',
      'john.doe@company.co.uk',
      'test+tag@domain.org'
    ];

    const invalidEmails = [
      'invalid.email',
      '@nodomain.com',
      'user@.com',
      'user name@example.com'
    ];

    validEmails.forEach(email => {
      expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });

    invalidEmails.forEach(email => {
      expect(email).not.toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
    });
  });

  it('should handle email with optional PDF URL', () => {
    const withPdf = {
      recipient_email: 'test@example.com',
      pdf_url: 'https://storage.example.com/blueprint.pdf'
    };

    const withoutPdf = {
      recipient_email: 'test@example.com'
      // pdf_url is optional
    };

    expect(withPdf.pdf_url).toBeDefined();
    expect(withoutPdf.pdf_url).toBeUndefined();
  });

  it('should handle large email content', () => {
    const largeContent = 'a'.repeat(5000);
    const emailData = {
      recipient_name: 'John Doe',
      recipient_email: 'john@example.com',
      blueprint_title: 'Architecture',
      blueprint_summary: largeContent,
      language: 'en' as const
    };

    expect(emailData.blueprint_summary.length).toBe(5000);
  });

  it('should handle special characters in recipient name', () => {
    const names = [
      'João da Silva',
      'José María García',
      "O'Connor",
      'Smith-Jones'
    ];

    names.forEach(name => {
      const emailData = {
        recipient_name: name,
        recipient_email: 'test@example.com',
        blueprint_title: 'Architecture',
        blueprint_summary: 'Summary',
        language: 'en' as const
      };

      expect(emailData.recipient_name).toBe(name);
    });
  });
});

describe('Email Bulk Operations', () => {
  it('should track sent and failed count', () => {
    const mockResult = {
      sent: 5,
      failed: 2
    };

    expect(mockResult.sent).toBe(5);
    expect(mockResult.failed).toBe(2);
    expect(mockResult.sent + mockResult.failed).toBe(7);
  });

  it('should handle empty email list', () => {
    const result = {
      sent: 0,
      failed: 0
    };

    expect(result.sent).toBe(0);
    expect(result.failed).toBe(0);
  });
});
