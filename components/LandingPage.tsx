import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { Mic, MicOff, Square, Sparkles, Star } from 'lucide-react';
import { createProblemRecord, analyzeProblemWithEdgeFunction, improveProblemTextWithAI, transcribeAudioWithAI } from '../lib/supabase/problems';
import { validateProblemText, checkRateLimit } from '../lib/validation/problem';
import { analytics } from '../lib/analytics';
import { useToast } from './ui/Toast';
import { useAudioRecorder, blobToBase64, formatDuration } from '../src/hooks/useAudioRecorder';

type DomainType = 'technical' | 'business' | 'strategic';

interface LandingPageProps {
  onAnalyze: (problem: string, domain: DomainType, problemId: string) => void;
}

// Question prompts are now loaded from i18n translations


const LandingPage: React.FC<LandingPageProps> = ({ onAnalyze }) => {
  const { t, i18n } = useTranslation('landing');
  const [problemText, setProblemText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [isImproving, setIsImproving] = useState(false);
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [activeQuestion, setActiveQuestion] = useState<number | null>(0);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);
  const toast = useToast();

  // P2: Audio recording hook
  const {
    isRecording,
    isSupported: isAudioSupported,
    permissionStatus,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error: audioError,
  } = useAudioRecorder();

  const canAnalyze = problemText.length >= 20 && !isProcessing;

  // Get the full example from i18n
  const fullExampleText = t('fullExample', '');

  // Typing effect for demo
  useEffect(() => {
    let timer: ReturnType<typeof setTimeout> | null = null;
    let typeInterval: ReturnType<typeof setInterval> | null = null;

    if (problemText === '' && !isTyping && fullExampleText) {
      // Auto-fill example after 2 seconds if empty
      timer = setTimeout(() => {
        setIsTyping(true);
        let currentIndex = 0;
        typeInterval = setInterval(() => {
          if (currentIndex < fullExampleText.length) {
            setProblemText(fullExampleText.substring(0, currentIndex + 1));
            currentIndex++;
          } else {
            if (typeInterval) clearInterval(typeInterval);
            setIsTyping(false);
          }
        }, 15);
      }, 2000);
    }

    // Cleanup both timer and interval on unmount
    return () => {
      if (timer) clearTimeout(timer);
      if (typeInterval) clearInterval(typeInterval);
    };
  }, [problemText, isTyping, fullExampleText]);

  const handleQuestionClick = (index: number) => {
    setActiveQuestion(index);
    const promptKeys = ['affected', 'current', 'ideal', 'references'];
    const prompt = t(`questionPrompts.${promptKeys[index]}`, '');
    setProblemText((prev) => prev + prompt);
    if (isTyping) setIsTyping(false);
    textAreaRef.current?.focus();
  };

  // P7: Preserve existing text when using full example
  const handleUseFullExample = () => {
    const fullExample = t('fullExample', '');
    const currentText = problemText.trim();

    // Append example instead of replacing (P7 requirement)
    const consolidated = currentText
      ? `${currentText}\n\n${fullExample}`
      : fullExample;

    setProblemText(consolidated);
    if (isTyping) setIsTyping(false);
    textAreaRef.current?.focus();
  };

  const canImprove = problemText.length >= 15 && !isImproving && !isProcessing;

  const handleImproveWithAI = async () => {
    if (!canImprove) return;

    setIsImproving(true);
    if (isTyping) setIsTyping(false);

    try {
      toast.info(t('aiImprove.processing', 'Melhorando texto com IA...'));

      // Use Edge Function (secure - API key stays on server)
      const currentLanguage = i18n.language || 'pt-BR';
      const improvedText = await improveProblemTextWithAI(problemText, currentLanguage);
      setProblemText(improvedText);

      toast.success(t('aiImprove.success', 'Texto aprimorado com sucesso!'));

      analytics.trackEvent('ai_improve_used', {
        original_length: problemText.length,
        improved_length: improvedText.length,
      });
    } catch (error) {
      console.error('[Landing] AI Improve Error:', error);
      toast.error(t('aiImprove.error', 'Erro ao melhorar texto. Tente novamente.'));
    } finally {
      setIsImproving(false);
    }
  };

  // P2: Audio recording handlers
  const handleAudioRecord = async () => {
    if (isTyping) setIsTyping(false);

    if (isRecording) {
      // Stop recording and transcribe
      toast.info(t('audio.stopping', 'Finalizando gravação...'));
      const audioBlob = await stopRecording();

      if (audioBlob && audioBlob.size > 0) {
        setIsTranscribing(true);
        toast.info(t('audio.transcribing', 'Transcrevendo áudio...'));

        try {
          const base64Audio = await blobToBase64(audioBlob);
          const currentLanguage = i18n.language || 'pt-BR';
          const transcribedText = await transcribeAudioWithAI(
            base64Audio,
            audioBlob.type || 'audio/webm',
            currentLanguage
          );

          // Append transcribed text to problem text
          const currentText = problemText.trim();
          const newText = currentText
            ? `${currentText}\n\n${transcribedText}`
            : transcribedText;

          setProblemText(newText);
          toast.success(t('audio.success', 'Áudio transcrito com sucesso!'));

          analytics.trackEvent('audio_transcribed', {
            audio_size: audioBlob.size,
            transcription_length: transcribedText.length,
            language: currentLanguage,
          });
        } catch (error) {
          console.error('[Landing] Transcription error:', error);
          toast.error(t('audio.error', 'Erro ao transcrever áudio. Tente novamente.'));
        } finally {
          setIsTranscribing(false);
        }
      }
    } else {
      // Start recording
      if (!isAudioSupported) {
        toast.error(t('audio.notSupported', 'Gravação de áudio não suportada neste navegador.'));
        return;
      }

      if (permissionStatus === 'denied') {
        toast.error(t('audio.permissionDenied', 'Permissão de microfone negada. Verifique as configurações do navegador.'));
        return;
      }

      try {
        await startRecording();
        toast.info(t('audio.recording', 'Gravando... Clique novamente para parar.'));
      } catch (error) {
        console.error('[Landing] Recording start error:', error);
        toast.error(t('audio.startError', 'Erro ao iniciar gravação.'));
      }
    }
  };

  // Show audio error if any
  useEffect(() => {
    if (audioError) {
      toast.error(audioError);
    }
  }, [audioError]);

  const handleAnalyze = async () => {
    // Validation
    const validation = validateProblemText(problemText);
    if (!validation.valid) {
      toast.error(validation.errors[0]);
      return;
    }

    // Rate Limiting
    const visitorId = localStorage.getItem('am_visitor_id') || 'unknown';
    const rateLimit = checkRateLimit(visitorId);
    if (!rateLimit.allowed) {
      toast.error(`${t('errors.rateLimit', 'Aguarde')} ${rateLimit.retryAfter}s`);
      return;
    }

    setIsProcessing(true);
    try {
      // Create problem record in database
      const problemId = await createProblemRecord(problemText);

      // Process with AI NLP
      await analyzeProblemWithEdgeFunction(problemText, problemId);

      // Track analytics
      analytics.trackEvent('problem_submitted', {
        length: problemText.length,
        domain: 'business',
        has_context: problemText.length > 50,
        source: 'landing_v2'
      });

      toast.success(t('success.analyzed', 'Análise completa! Avançando...'));

      // Advance to Phase 2 with a small delay for UX
      setTimeout(() => {
        onAnalyze(problemText, 'business', problemId);
      }, 800);

    } catch (error) {
      console.error('[Landing] Error processing problem:', error);
      toast.error(t('errors.processing', 'Erro ao processar. Tente novamente.'));
    } finally {
      setIsProcessing(false);
    }
  };

  const questions = [
    { label: t('questions.affected', 'Quem é afetado?'), active: true },
    { label: t('questions.current', 'Solução atual?'), active: false },
    { label: t('questions.ideal', 'Cenário ideal?'), active: false },
    { label: t('questions.references', 'Que referências você tem?'), active: false },
  ];

  return (
    <div className="min-h-screen bg-ds-bg text-slate-100 flex flex-col font-body overflow-x-hidden">
      {/* Background Effects */}
      <div className="fixed inset-0 pointer-events-none bg-gradient-to-b from-ds-bg via-[#0d1630] to-[#05091a] z-0" />
      <div className="fixed top-0 left-1/4 w-[500px] h-[500px] bg-teal-500/5 rounded-full blur-[100px] pointer-events-none z-0" />
      <div className="fixed bottom-0 right-1/4 w-[500px] h-[500px] bg-blue-600/5 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Main Content */}
      <main className="relative z-10 flex-grow flex flex-col items-center justify-center px-4 md:px-6 w-full max-w-7xl mx-auto mt-24 md:mt-28">

        {/* Badge */}
        <div className="mb-8 animate-border-glow inline-flex items-center justify-center px-5 py-1.5 rounded-full border border-teal-500/40 bg-ds-surface/90 backdrop-blur-md shadow-[0_0_15px_rgba(45,212,191,0.15)]">
          <span className="flex h-2 w-2 relative mr-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-teal-500" />
          </span>
          <span className="text-xs font-bold bg-gradient-to-r from-teal-400 to-cyan-300 bg-clip-text text-transparent uppercase tracking-wider">
            {t('badge', 'AI-Driven Smart Solutions')}
          </span>
        </div>

        {/* Title */}
        <h1 className="text-[34px] md:text-[52px] font-bold text-center mb-12 leading-tight max-w-4xl mx-auto">
          <span className="text-white drop-shadow-md">
            {t('hero.line1', 'Transforme o caos operacional em')}
          </span>
          <br className="hidden md:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan-400 to-teal-200 drop-shadow-[0_0_10px_rgba(45,212,191,0.3)]">
            {t('hero.line2', 'Soluções inteligentes')}
          </span>
        </h1>

        {/* Main Grid - 2 Columns */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Left Column - Problem Input Panel (8 cols) */}
          <div className="lg:col-span-8 relative group">
            {/* Glow effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-teal-500/20 to-cyan-500/20 rounded-2xl blur-xl opacity-30 group-hover:opacity-50 transition duration-1000" />

            {/* Glass Panel */}
            <div className="relative w-full glass-panel rounded-2xl shadow-2xl overflow-hidden flex flex-col min-h-[500px]">

              {/* Content Area */}
              <div className="relative flex-grow overflow-hidden flex flex-col">

                {/* IA Refinando Badge */}
                {(isTyping || isImproving) && (
                  <div className="absolute bottom-6 right-6 z-20 flex items-center gap-2 bg-teal-900/40 border border-teal-500/30 px-3 py-1.5 rounded-full backdrop-blur-sm badge-pulse shadow-[0_0_10px_rgba(20,184,166,0.2)]">
                    <span className="relative flex h-2.5 w-2.5">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-teal-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-teal-500" />
                    </span>
                    <span className="text-xs font-semibold text-teal-300 uppercase tracking-wide">
                      {isImproving
                        ? t('aiImprove.processing', 'IA Aprimorando...')
                        : t('aiRefining', 'IA Refinando...')
                      }
                    </span>
                  </div>
                )}

                {/* Text Display / Input Area */}
                <div className="flex-grow p-6 md:p-8 font-light text-lg leading-relaxed text-slate-300 custom-scrollbar overflow-y-auto">
                  <textarea
                    ref={textAreaRef}
                    className="w-full h-full min-h-[300px] bg-transparent border-none outline-none resize-none text-lg text-slate-300 placeholder-slate-500"
                    placeholder={t('placeholder', 'Descreva o problema que você quer resolver...')}
                    value={problemText}
                    onChange={(e) => {
                      // Stop auto-typing if user starts typing manually
                      if (isTyping) {
                        setIsTyping(false);
                      }
                      setProblemText(e.target.value);
                    }}
                    disabled={isProcessing}
                  />
                </div>
              </div>

              {/* Bottom Action Bar */}
              <div className="p-4 md:p-6 border-t border-slate-700/50 flex flex-col md:flex-row justify-between items-center gap-4 bg-ds-bg/50">
                <div className="flex items-center gap-3 w-full md:w-auto">
                  {/* Gravar Áudio Button - P2 */}
                  <button
                    onClick={handleAudioRecord}
                    disabled={isProcessing || isTranscribing || !isAudioSupported}
                    className={`relative flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium w-full md:w-auto transition-all ${
                      isRecording
                        ? 'bg-red-600/80 border border-red-500 text-white animate-pulse shadow-[0_0_15px_rgba(239,68,68,0.4)]'
                        : isTranscribing
                        ? 'bg-teal-900/40 border border-teal-500/50 text-teal-300'
                        : isAudioSupported
                        ? 'border border-slate-600 text-slate-300 hover:bg-slate-800 hover:text-white hover:shadow-lg'
                        : 'border border-slate-700/50 text-slate-500 cursor-not-allowed'
                    }`}
                    aria-label={isRecording ? t('buttons.stopRecording', 'Parar Gravação') : t('buttons.recordAudio', 'Gravar Áudio')}
                  >
                    {isRecording ? (
                      <>
                        <Square className="w-4 h-4" />
                        <span>{formatDuration(recordingDuration)}</span>
                        <span className="hidden sm:inline">{t('buttons.stopRecording', 'Parar')}</span>
                      </>
                    ) : isTranscribing ? (
                      <>
                        <Mic className="w-4 h-4 animate-pulse" />
                        {t('audio.transcribing', 'Transcrevendo...')}
                      </>
                    ) : (
                      <>
                        {permissionStatus === 'denied' ? (
                          <MicOff className="w-4 h-4" />
                        ) : (
                          <Mic className="w-4 h-4" />
                        )}
                        {t('buttons.recordAudio', 'Gravar Áudio')}
                      </>
                    )}
                  </button>

                  {/* Melhorar com IA Button */}
                  <button
                    onClick={handleImproveWithAI}
                    disabled={!canImprove}
                    className={`relative overflow-hidden flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold w-full md:w-auto group transition-all ${
                      canImprove
                        ? 'bg-gradient-to-r from-teal-900/40 to-cyan-900/40 border border-teal-500/50 text-teal-300 shadow-[0_0_15px_rgba(45,212,191,0.2)] hover:shadow-[0_0_25px_rgba(45,212,191,0.4)] hover:border-teal-400'
                        : 'bg-slate-800/30 border border-slate-700/30 text-slate-500 cursor-not-allowed'
                    }`}
                    aria-label={t('buttons.improveWithAI', 'Melhorar com IA')}
                  >
                    {isImproving && (
                      <div className="absolute inset-0 bg-teal-500/10 animate-pulse" />
                    )}
                    <Sparkles
                      className={`w-4 h-4 ${isImproving ? 'animate-spin' : ''}`}
                      style={{ animationDuration: '1s' }}
                    />
                    {isImproving
                      ? t('aiImprove.processing', 'Melhorando...')
                      : t('buttons.improveWithAI', 'Melhorar com IA')
                    }
                  </button>
                </div>

                {/* Analisar com IA Button */}
                <div className="w-full md:w-auto">
                  <button
                    onClick={handleAnalyze}
                    disabled={!canAnalyze}
                    className={`flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-sm font-medium w-full md:w-auto transition-all ${
                      canAnalyze
                        ? 'bg-gradient-to-r from-teal-600 to-cyan-600 text-white hover:from-teal-500 hover:to-cyan-500 shadow-lg shadow-teal-500/20 hover:shadow-teal-500/40'
                        : 'bg-slate-800/50 text-slate-500 border border-slate-700/50 cursor-not-allowed'
                    }`}
                    aria-label={t('buttons.analyzeWithAI', 'Analisar com IA')}
                  >
                    {isProcessing ? (
                      <>
                        <span className="animate-spin">
                          <Sparkles className="w-4 h-4" />
                        </span>
                        {t('processing', 'Processando...')}
                      </>
                    ) : (
                      <>
                        {t('buttons.analyzeWithAI', 'Analisar com IA')}
                        <Star className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Questões Guia (4 cols) */}
          <div className="lg:col-span-4 flex justify-start lg:sticky lg:top-28 lg:self-start">
            <div className="inline-flex flex-col gap-4 p-5 rounded-2xl bg-ds-surface/40 border border-slate-700/30 backdrop-blur-sm w-full lg:w-max max-w-full z-0">
              <h3 className="text-xl font-bold text-white mb-1 pl-1 tracking-tight">
                {t('questionsGuide.title', 'Questões Guia')}
              </h3>

              {/* Question Buttons */}
              {questions.map((question, idx) => (
                <button
                  key={idx}
                  onClick={() => handleQuestionClick(idx)}
                  className={`w-full text-left relative group overflow-hidden transition-all ${
                    activeQuestion === idx
                      ? 'p-[1px] rounded-xl bg-gradient-to-r from-teal-500 to-cyan-500 shadow-[0_0_20px_rgba(20,184,166,0.2)]'
                      : 'px-6 py-4 rounded-xl bg-ds-surface border border-slate-700/50 text-slate-400 hover:border-slate-500 hover:text-white hover:bg-ds-surface/80'
                  }`}
                  aria-label={question.label}
                >
                  {activeQuestion === idx ? (
                    <div className="bg-ds-surface rounded-[10px] px-6 py-4 flex items-center justify-between h-full relative overflow-hidden group-hover:bg-[#15203e] transition-colors">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-gradient-to-b from-teal-400 to-cyan-500 shadow-[0_0_10px_rgba(45,212,191,0.8)]" />
                      <span className="font-medium text-white pl-2 whitespace-nowrap">{question.label}</span>
                    </div>
                  ) : (
                    <>
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-teal-500/0 group-hover:bg-teal-500/50 transition-colors" />
                      <span className="pl-2 group-hover:pl-3 transition-all duration-300 whitespace-nowrap font-medium">
                        {question.label}
                      </span>
                    </>
                  )}
                </button>
              ))}

              {/* Usar Exemplos Completo Button */}
              <button
                onClick={handleUseFullExample}
                className="w-full text-left px-6 py-4 rounded-xl border border-teal-400/70 bg-teal-900/10 text-teal-300 hover:bg-teal-900/30 hover:border-teal-400 hover:text-white transition-all font-semibold relative group overflow-hidden shadow-[0_0_15px_rgba(20,184,166,0.1)] hover:shadow-[0_0_20px_rgba(45,212,191,0.25)] mt-2"
                aria-label={t('questionsGuide.useFullExample', 'Usar Exemplos Completo')}
              >
                <div className="flex items-center justify-between">
                  <span className="pl-2 whitespace-nowrap">
                    {t('questionsGuide.useFullExample', 'Usar Exemplos Completo')}
                  </span>
                  <Sparkles className="w-5 h-5 opacity-80 group-hover:opacity-100 transition-opacity" />
                </div>
              </button>
            </div>
          </div>
        </div>

        {/* Footer Line */}
        <p className="mt-16 mb-12 text-center text-slate-400 text-lg md:text-xl font-medium max-w-2xl">
          {t('footer.tagline', 'Sua dor de negócio vira sistema funcionando')}{' '}
          <span className="text-teal-400 font-bold drop-shadow-[0_0_8px_rgba(45,212,191,0.3)]">
            {t('footer.highlight', 'em tempo recorde')}
          </span>
        </p>
      </main>

      {/* Custom Styles */}
      <style>{`
        .glass-panel {
          background: rgba(18, 26, 51, 0.7);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
          border: 1px solid rgba(45, 212, 191, 0.15);
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background-color: rgba(45, 212, 191, 0.1);
          border-radius: 4px;
        }

        @keyframes shimmer {
          0% { opacity: 0.6; }
          50% { opacity: 1; }
          100% { opacity: 0.6; }
        }
        .animate-text-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes subtle-pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.9; }
        }
        .badge-pulse {
          animation: subtle-pulse 1.5s ease-in-out infinite;
        }

        @keyframes border-glow {
          0%, 100% { border-color: rgba(20, 184, 166, 0.4); box-shadow: 0 0 8px rgba(20, 184, 166, 0.15); }
          50% { border-color: rgba(45, 212, 191, 0.9); box-shadow: 0 0 20px rgba(45, 212, 191, 0.4); }
        }
        .animate-border-glow {
          animation: border-glow 3s infinite;
        }
      `}</style>
    </div>
  );
};

export default LandingPage;
