import React, { useState, useEffect } from 'react';
import type { Question, GameSettings } from '@/types/FlashQATypes';
import { RotateCw, Clock, CheckCircle, XCircle } from 'lucide-react';

// Base64 short audio snippets to avoid external dependencies
const SOUND_SUCCESS = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgRYWFgAAAAtaAAAAG1pbm9yX3ZlcnNpb24AMABjb21wYXRpYmxlX2JyYW5kcwBtcDQyaXNvbQB3bW00AAAAAHVyYmwAAAAMAAAAAAAAB5gAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAAAsAAJCQkJCTk5OTk5SUlJSUlxcXFxcZmZmZmZubm5ubnJyclJSU1NTU1/////////////////AAAAAExhdmY1OC4yMAAAAAAAAAAAAAAAJAAAAAAAAAAAASccF6wAAAAAAAAAAAAAAAAAAAAA//uQZAAP8AAAaQAAAADgAAA0gAAAAABAAABpAAAAOAAADSAAAAAETEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpTQU1F//uQZAAP8AAANIAAAAwAAANIAAAAABAAABpAAAAMAAADSAAAAAE1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7kGQAD/AAADSAAAAABAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";
const SOUND_DIFFICULT = "data:audio/mp3;base64,SUQzBAAAAAABAFRYWFgAAAASAAADbWFqb3JfYnJhbmQAbXA0MgRYWFgAAAAtaAAAAG1pbm9yX3ZlcnNpb24AMABjb21wYXRpYmxlX2JyYW5kcwBtcDQyaXNvbQB3bW00AAAAAHVyYmwAAAAMAAAAAAAAB5gAAAAA//uQZAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAAEAAAAnQAJCQkJCTk5OTk5SUlJSUlxcXFxcZmZmZmZubm5ubnJyclJSU1NTU1/////////////////AAAAAExhdmY1OC4yMAAAAAAAAAAAAAAAJAAAAAAAAAAAASccF6wAAAAAAAAAAAAAAAAAAAAA//uQZAAP8AAAaQAAAADgAAA0gAAAAABAAABpAAAAOAAADSAAAAAETEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqpTQU1F//uQZAAP8AAANIAAAAwAAANIAAAAABAAABpAAAAMAAADSAAAAAE1FMy4xMDCqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqv/7kGQAD/AAADSAAAAABAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq//uQZAAP8AAANIAAAAAEAAANIAAAAAAQAAAaQAAAAgAAA0gAAAAATEFNRTMuMTAwqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqqq";

interface FlashcardScreenProps {
  questions: Question[];
  settings: GameSettings;
  onFinish: (results: { questionId: string; flagged: boolean }[]) => void;
  onExit: () => void;
}

const FlashcardScreen: React.FC<FlashcardScreenProps> = ({ questions, settings, onFinish, onExit }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [timeLeft, setTimeLeft] = useState(settings.timePerCard);
  const [answers, setAnswers] = useState<{ questionId: string; flagged: boolean }[]>([]);
  
  // Feedback animation state
  const [feedbackState, setFeedbackState] = useState<'difficult' | 'success' | null>(null);

  const currentQuestion = questions[currentIndex];

  // Timer Logic
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 0) return 0;
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentIndex]);

  // Reset state when question changes
  useEffect(() => {
    setTimeLeft(settings.timePerCard);
    setIsFlipped(false);
    setFeedbackState(null);
  }, [currentIndex, settings.timePerCard]);

  const processNextQuestion = (flagged: boolean) => {
    const newAnswers = [...answers, { questionId: currentQuestion.id, flagged }];
    setAnswers(newAnswers);

    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      onFinish(newAnswers);
    }
  };

  const playFeedbackSound = (flagged: boolean) => {
    try {
      const audio = new Audio(flagged ? SOUND_DIFFICULT : SOUND_SUCCESS);
      audio.volume = 0.5;
      audio.play().catch(e => console.log("Audio play failed (interaction required):", e));
    } catch (error) {
      console.error("Error playing audio", error);
    }
  };

  const handleAnswerInteraction = (flagged: boolean) => {
    if (feedbackState) return; // Prevent double clicks

    // 1. Audio Feedback
    playFeedbackSound(flagged);

    // 2. Visual Feedback
    setFeedbackState(flagged ? 'difficult' : 'success');

    // 3. Wait for animation, then process
    setTimeout(() => {
      processNextQuestion(flagged);
    }, 500);
  };

  const progress = ((currentIndex) / questions.length) * 100;

  return (
    <div className="max-w-2xl mx-auto px-4">
      {/* Header: Progress & Time */}
      <div className="flex justify-between items-center mb-4">
        <div className="flex flex-col">
            <span className="text-xs font-bold text-primary uppercase tracking-wider">Progresso</span>
            <span className="text-lg font-bold text-primary">{currentIndex + 1} <span className="text-base-content text-sm">/</span> {questions.length}</span>
        </div>
        <div className={`flex items-center gap-2 px-4 py-2 rounded-xl border-2 font-mono font-bold shadow-sm transition-all duration-300 ${timeLeft < 10 ? 'bg-error text-error-content border-error animate-pulse scale-105' : 'bg-base-100 border-base-200 text-base-content'}`}>
            <Clock className="w-4 h-4" />
            {Math.floor(timeLeft / 60)}:{(timeLeft % 60).toString().padStart(2, '0')}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-2 bg-base-200 rounded-full mb-8 overflow-hidden shadow-inner">
        <div 
          className="h-full bg-primary transition-all duration-500 ease-out rounded-full relative"
          style={{ width: `${progress}%` }}
        >
            <div className="absolute right-0 top-0 h-full w-2 bg-white/30 animate-pulse"></div>
        </div>
      </div>

      {/* Flashcard Area */}
      <div className="relative h-96 w-full perspective-1000 mb-8 group">
        <div 
          className={`relative w-full h-full transition-all duration-700 transform-style-3d`}
        >
          {/* Front of Card */}
          <div className="absolute w-full h-full backface-hidden bg-base-100 rounded-3xl shadow-xl border border-base-200 flex flex-col items-center justify-center p-8 text-center cursor-pointer hover:shadow-2xl transition-shadow" onClick={() => !feedbackState && setIsFlipped(true)}>
             <div className="absolute top-0 left-0 w-full h-2 bg-primary/90 rounded-t-3xl opacity-90"></div>
             
             <span className="absolute top-8 inline-flex items-center gap-1 px-3 py-1 text-[10px] font-bold uppercase tracking-wider text-primary bg-primary/10 rounded-full border border-primary/20">
               <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
               {currentQuestion.category}
             </span>
             
             <h3 className="text-2xl md:text-3xl font-bold text-base-content leading-snug mt-4">
               {currentQuestion.text}
             </h3>

          </div>

          {/* Back of Card */}
          <div className="absolute w-full h-full backface-hidden rotate-y-180 bg-neutral text-neutral-content rounded-3xl shadow-2xl flex flex-col items-center justify-center p-8 text-center border border-neutral-700">
            
            <div className="w-full overflow-y-auto max-h-[80%] mb-4 pr-2 scrollbar-thin scrollbar-thumb-neutral-500 scrollbar-track-transparent">
                <h4 className="badge badge-secondary text-xs uppercase tracking-[0.2em] mb-4 border-b border-neutral-700 pb-2">Dica de Resposta</h4>
                <p className="text-xl text-neutral-content/90 font-light leading-relaxed">
                  {currentQuestion.hint || "Sem dica disponível para esta pergunta."}
                </p>
            </div>

            <div className="flex flex-col w-full gap-3 mt-auto z-10">
                <button 
                    onClick={() => !feedbackState && setIsFlipped(false)}
                    disabled={!!feedbackState}
                    className="text-xs text-neutral-content/70 hover:text-neutral-content font-semibold uppercase tracking-wider transition-colors py-2"
                >
                    Ver pergunta novamente
                </button>
            </div>
          </div>
        </div>
      </div>

      {/* Controls with Feedback Animation */}
      <div className="grid grid-cols-2 gap-4">
        <button
            onClick={() => handleAnswerInteraction(true)}
            disabled={!!feedbackState}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border shadow-sm
            ${feedbackState === 'difficult' 
                ? 'bg-error border-error text-error-content scale-95 shadow-inner' 
                : feedbackState === 'success'
                    ? 'bg-base-200 border-base-200 text-base-content/40 opacity-60'
                    : 'bg-base-100 text-base-content hover:bg-error/10 hover:text-error border-base-200 hover:border-error hover:shadow-md hover:-translate-y-1'
            }`}
        >
            <div className={`p-3 rounded-full mb-2 transition-colors ${feedbackState === 'difficult' ? 'bg-error/20' : 'bg-error/10 group-hover:bg-error/20'}`}>
                <XCircle className={`w-6 h-6 ${feedbackState === 'difficult' ? 'text-error-content' : 'text-error'}`} />
            </div>
            <span className="font-bold text-sm">Foi Difícil</span>
            <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wide">Preciso revisar</span>
        </button>

        <button
            onClick={() => handleAnswerInteraction(false)}
            disabled={!!feedbackState}
            className={`group relative overflow-hidden flex flex-col items-center justify-center p-6 rounded-2xl transition-all duration-300 border shadow-sm
            ${feedbackState === 'success' 
                ? 'bg-success border-success text-success-content scale-95 shadow-inner' 
                : feedbackState === 'difficult'
                    ? 'bg-base-200 border-base-200 text-base-content/40 opacity-60'
                    : 'bg-base-100 text-base-content hover:bg-success/10 hover:text-success border-base-200 hover:border-success hover:shadow-md hover:-translate-y-1'
            }`}
        >
             <div className={`p-3 rounded-full mb-2 transition-colors ${feedbackState === 'success' ? 'bg-success/20' : 'bg-success/10 group-hover:bg-success/20'}`}>
                <CheckCircle className={`w-6 h-6 ${feedbackState === 'success' ? 'text-success-content' : 'text-success'}`} />
            </div>
            <span className="font-bold text-sm">Respondi Bem</span>
            <span className="text-[10px] font-medium opacity-60 mt-1 uppercase tracking-wide">Próxima carta</span>
        </button>
      </div>
      
      <div className="mt-8 flex justify-center">
        <button 
            onClick={onExit} 
            disabled={!!feedbackState}
            className="text-base-content/70 text-xs font-bold hover:text-error disabled:opacity-30 flex items-center gap-1 px-4 py-2 rounded-full hover:bg-error/10 transition-colors"
        >
            SAIR DO TREINO
        </button>
      </div>
    </div>
  );
};

export default FlashcardScreen;