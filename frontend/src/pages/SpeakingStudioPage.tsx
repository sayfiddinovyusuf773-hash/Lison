import React, { useState, useEffect, useRef } from 'react';
import { SpeakingTopic, SpeakingResult } from '../types';
import { useAuth } from '../context/AuthContext';
import confetti from 'canvas-confetti';
import {
  Mic,
  MicOff,
  Play,
  RotateCcw,
  Sparkles,
  Award,
  CheckCircle2,
  Volume2,
  HelpCircle,
  Clock,
  ArrowRight
} from 'lucide-react';

export const SpeakingStudioPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();

  const [topics, setTopics] = useState<SpeakingTopic[]>([]);
  const [selectedTopic, setSelectedTopic] = useState<SpeakingTopic | null>(null);
  const [loading, setLoading] = useState(true);

  // Audio recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [transcript, setTranscript] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<SpeakingResult | null>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [micError, setMicError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    const fetchTopicsAndHistory = async () => {
      try {
        const resTopics = await fetch('/api/speaking/topics');
        const dataTopics = await resTopics.json();
        if (dataTopics.success && dataTopics.topics) {
          setTopics(dataTopics.topics);
          setSelectedTopic(dataTopics.topics[0]);
        }

        if (user) {
          const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
          const resHist = await fetch('/api/speaking/history', {
            headers: { Authorization: `Bearer ${token}` }
          });
          const dataHist = await resHist.json();
          if (dataHist.success) {
            setHistory(dataHist.history);
          }
        }
      } catch (err) {
        console.error('Fetch speaking error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchTopicsAndHistory();
  }, [user]);

  // Speech Recognition setup
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = selectedTopic?.language === 'Russian' ? 'ru-RU' : 'en-US';

      recognition.onresult = (event: any) => {
        let currentTranscript = '';
        for (let i = event.resultIndex; i < event.results.length; i++) {
          currentTranscript += event.results[i][0].transcript;
        }
        if (currentTranscript) {
          setTranscript(currentTranscript);
        }
      };

      recognition.onerror = () => {
        setIsRecording(false);
      };

      recognitionRef.current = recognition;
    }
  }, [selectedTopic]);

  const startRecording = async () => {
    if (!user) {
      openAuthModal('register', '/speaking');
      return;
    }

    setMicError(null);
    setTranscript('');
    setResult(null);
    setAudioUrl(null);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const url = URL.createObjectURL(audioBlob);
        setAudioUrl(url);
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);

      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
        } catch {
          // ignore if already started
        }
      }
    } catch (err: any) {
      setMicError(
        err?.name === 'NotAllowedError' || err?.name === 'PermissionDeniedError'
          ? "Mikrofon ruxsati rad etildi. Brauzer manzili yonidagi qulf/mikrofon belgisini bosib ruxsat bering va sahifani yangilang."
          : "Mikrofon qurilmasi topilmadi yoki ulanib bo'lmadi. Iltimos, mikrofon ulanganini tekshiring."
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      if (recognitionRef.current) {
        try {
          recognitionRef.current.stop();
        } catch {
          // ignore
        }
      }
    }
  };

  const handleAnalyze = async () => {
    if (!transcript.trim()) {
      setMicError("Avval mikrofonga gapiring yoki matn maydoniga nutqingizni yozing.");
      return;
    }
    setMicError(null);

    setAnalyzing(true);
    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch('/api/speaking/analyze', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          topic_id: selectedTopic?.title_uz || 'General Speaking',
          target_language: selectedTopic?.language || 'English',
          transcript: transcript
        })
      });

      const data = await res.json();
      if (data.success && data.result) {
        setResult(data.result);
        if (data.result.overall_score >= 80) {
          confetti({
            particleCount: 80,
            spread: 70,
            origin: { y: 0.6 }
          });
        }
        // Refresh history from server
        setHistory((prev) => [data.result, ...prev]);
        fetch('/api/speaking/history', {
          headers: { Authorization: `Bearer ${token}` }
        })
          .then((r) => r.json())
          .then((histData) => {
            if (histData.success && Array.isArray(histData.history)) {
              setHistory(histData.history);
            }
          })
          .catch(() => {});
      }
    } catch (err) {
      console.error('Speaking analysis error:', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const handleTryAgain = () => {
    setResult(null);
    setTranscript('');
    setAudioUrl(null);
  };

  return (
    <div className="min-h-screen py-10 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold mb-3">
            <Mic className="w-3.5 h-3.5" />
            AI Speaking Studio Pro
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Jonli Nutq va Talaffuz Studiyasi
          </h1>
          <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
            Mavzuni tanlang, mikrofonga erkin gapiring va talaffuzingiz, grammatikangiz hamda so'z boyligingiz bo'yicha sun'iy intellekt xulosasini oling.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left: Topic Selector */}
          <div className="lg:col-span-4 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400">
              Suhbat Mavzulari
            </h3>
            <div className="space-y-3">
              {topics.map((t) => {
                const isSelected = selectedTopic?.id === t.id;
                return (
                  <button
                    key={t.id}
                    onClick={() => { setSelectedTopic(t); handleTryAgain(); }}
                    className={`w-full p-4 rounded-2xl border text-left transition flex flex-col justify-between ${
                      isSelected
                        ? 'bg-primary-50 dark:bg-primary-950/60 border-primary-500 shadow-sm'
                        : 'bg-white dark:bg-gray-900 border-gray-100 dark:border-gray-800 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-primary-100 dark:bg-primary-950 text-primary-800 dark:text-primary-300">
                        {t.language} • {t.level}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white mt-2">
                      {t.title_uz}
                    </h4>
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {t.prompt}
                    </p>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Studio Workspace */}
          <div className="lg:col-span-8 space-y-6">
            {micError && (
              <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-rose-800 dark:text-rose-200 text-xs flex items-start gap-3">
                <MicOff className="w-5 h-5 shrink-0 text-rose-500 mt-0.5" />
                <div className="space-y-1">
                  <p className="font-bold">Mikrofon / Yozuv xatoligi</p>
                  <p>{micError}</p>
                </div>
              </div>
            )}
            {selectedTopic && (
              <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm space-y-6">
                {/* Topic Prompt Card */}
                <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/60 border border-gray-100 dark:border-gray-700/60 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-primary-600 dark:text-primary-400">
                      Vazifa Sharti:
                    </span>
                    <span className="text-xs font-semibold text-gray-500">
                      {selectedTopic.language} ({selectedTopic.level})
                    </span>
                  </div>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {selectedTopic.prompt}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 italic pt-1 border-t border-gray-200 dark:border-gray-700">
                    💡 Namuna jumla: "{selectedTopic.sample_sentence}"
                  </p>
                </div>

                {/* Recorder Console */}
                <div className="text-center py-6 space-y-4">
                  {/* Big mic action button */}
                  <div className="relative inline-block">
                    {isRecording && (
                      <div className="absolute -inset-4 rounded-full bg-red-500/20 animate-ping" />
                    )}
                    <button
                      onClick={isRecording ? stopRecording : startRecording}
                      className={`relative w-24 h-24 rounded-full flex items-center justify-center text-white shadow-2xl transition transform hover:scale-105 active:scale-95 ${
                        isRecording
                          ? 'bg-red-600 animate-pulse'
                          : 'bg-gradient-to-tr from-emerald-500 to-teal-600'
                      }`}
                    >
                      {isRecording ? <MicOff className="w-10 h-10" /> : <Mic className="w-10 h-10" />}
                    </button>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-gray-900 dark:text-white">
                      {isRecording ? 'Nutqingiz yozib olinmoqda...' : 'Gapirishni boshlash uchun bosing'}
                    </h4>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {isRecording
                        ? 'Gapirib bo\'lgach qizil tugmani bosing'
                        : 'Mikrofon ruxsati talab qilinadi'}
                    </p>
                  </div>

                  {/* Audio waveform / player if recorded */}
                  {audioUrl && (
                    <div className="pt-2 flex flex-wrap items-center justify-center gap-3">
                      <audio src={audioUrl} controls className="h-10 rounded-full" />
                    </div>
                  )}

                  {/* Transcript Display */}
                  <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-2xl border border-gray-100 dark:border-gray-700 text-left min-h-[80px]">
                    <span className="text-[10px] font-bold uppercase text-gray-400 block mb-1">
                      Nutq transkripti (Speech-to-Text):
                    </span>
                    <p className="text-xs sm:text-sm text-gray-800 dark:text-gray-200 italic">
                      {transcript || (isRecording ? 'Gapirishingiz kutilmoqda...' : 'Hozircha nutq kiritilmadi.')}
                    </p>
                  </div>

                  {/* Action buttons */}
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
                    <button
                      onClick={handleAnalyze}
                      disabled={analyzing || !transcript.trim() || isRecording}
                      className="px-6 py-3 rounded-2xl bg-gradient-to-r from-primary-600 to-indigo-600 hover:from-primary-500 hover:to-indigo-500 text-white font-bold text-xs shadow-lg shadow-primary-500/25 flex items-center gap-2 transition disabled:opacity-50"
                    >
                      <Sparkles className="w-4 h-4" />
                      <span>{analyzing ? 'AI tahlil qilmoqda...' : 'Nutqni Tahlil Qilish'}</span>
                    </button>

                    {(audioUrl || result) && (
                      <button
                        onClick={handleTryAgain}
                        className="px-4 py-3 rounded-2xl bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 text-gray-700 dark:text-gray-300 font-bold text-xs flex items-center gap-1.5 transition"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Qayta urinish</span>
                      </button>
                    )}
                  </div>
                </div>

                {/* Analysis Results Display */}
                {result && (
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-emerald-500/10 via-primary-500/10 to-transparent border border-emerald-500/30 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-sm font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Award className="w-5 h-5 text-emerald-500" />
                        Nutq Tahlili Natijalari (+{result.xp_earned} XP)
                      </h4>
                      <span className="text-xs font-black px-3 py-1 rounded-xl bg-emerald-600 text-white shadow-sm">
                        Umumiy: {result.overall_score}%
                      </span>
                    </div>

                    {/* Scores grid */}
                    <div className="grid grid-cols-3 gap-3 text-center">
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Talaffuz</p>
                        <p className="text-lg font-black text-emerald-600">{result.pronunciation_score}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Grammatika</p>
                        <p className="text-lg font-black text-primary-600">{result.grammar_score}%</p>
                      </div>
                      <div className="p-3 rounded-xl bg-white dark:bg-gray-800 shadow-sm">
                        <p className="text-[10px] text-gray-400 font-semibold uppercase">Lug'at boyligi</p>
                        <p className="text-lg font-black text-amber-500">{result.vocabulary_score}%</p>
                      </div>
                    </div>

                    <p className="text-xs text-gray-700 dark:text-gray-300 leading-relaxed">
                      💡 {result.feedback}
                    </p>

                    <div className="p-3 bg-white dark:bg-gray-800 rounded-xl text-xs space-y-1">
                      <span className="font-bold text-emerald-600 dark:text-emerald-400">
                        ✨ Tavsiya etilgan tabiiy jumla:
                      </span>
                      <p className="italic text-gray-800 dark:text-gray-200">
                        "{result.improved_sentence}"
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
