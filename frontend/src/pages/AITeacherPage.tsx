import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import {
  Bot,
  Send,
  Mic,
  MicOff,
  Volume2,
  Trash2,
  Sparkles,
  CheckCircle2,
  MessageSquare,
  BookOpen,
  Layers,
  ArrowRight,
  Copy,
  Check,
  Languages,
  RotateCcw
} from 'lucide-react';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  corrections?: {
    original: string;
    corrected: string;
    explanation: string;
  } | null;
  created_at?: string;
}

export const AITeacherPage: React.FC = () => {
  const { user, openAuthModal } = useAuth();
  const { t } = useLanguage();

  const welcomeMessage: ChatMessage = {
    id: 'welcome-msg',
    role: 'assistant',
    content: `Salom! Bugun qaysi tilni o‘rganamiz? 🌟\n\nMen LISON platformasining shaxsiy sun'iy intellekt ustozi bo'lib, sizga yangi so'zlarni yodlash, grammatikani to'g'ri qo'llash, xatolaringizni muloyim tushuntirish va jonli muloqot qilishda 24/7 yordam beraman.`
  };

  const [messages, setMessages] = useState<ChatMessage[]>([welcomeMessage]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [targetLanguage, setTargetLanguage] = useState('English');
  const [learningLevel, setLearningLevel] = useState('A1');
  const [activeMode, setActiveMode] = useState<'chat' | 'grammar' | 'vocabulary' | 'writing'>('chat');
  const [isListening, setIsListening] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [geminiConfigured, setGeminiConfigured] = useState<boolean | null>(null);

  useEffect(() => {
    fetch('/api/ai/status')
      .then((r) => r.json())
      .then((d) => {
        if (d.success) setGeminiConfigured(Boolean(d.gemini_configured));
      })
      .catch(() => {});
  }, []);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  // Speech Recognition setup (Web Speech API)
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang =
        targetLanguage === 'Russian'
          ? 'ru-RU'
          : targetLanguage === 'Korean'
          ? 'ko-KR'
          : targetLanguage === 'Arabic'
          ? 'ar-SA'
          : targetLanguage === 'German'
          ? 'de-DE'
          : targetLanguage === 'Uzbek'
          ? 'uz-UZ'
          : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognition.onerror = () => {
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [targetLanguage]);

  const toggleListening = () => {
    if (!recognitionRef.current) {
      alert("Brauzeringiz ovozli kiritishni (Web Speech API) qo'llab-quvvatlamaydi. Matn yozishingiz mumkin.");
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const playTTS = (text: string) => {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang =
      targetLanguage === 'Russian'
        ? 'ru-RU'
        : targetLanguage === 'Korean'
        ? 'ko-KR'
        : targetLanguage === 'German'
        ? 'de-DE'
        : targetLanguage === 'Arabic'
        ? 'ar-SA'
        : 'en-US';
    utterance.rate = 0.95;
    window.speechSynthesis.speak(utterance);
  };

  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleSend = async (e?: React.FormEvent, customText?: string) => {
    if (e) e.preventDefault();
    const userText = (customText || input).trim();
    if (!userText || loading) return;

    if (!user) {
      openAuthModal('login');
      return;
    }

    setInput('');

    const newMsg: ChatMessage = {
      id: 'usr-' + Date.now(),
      role: 'user',
      content: userText
    };

    setMessages((prev) => [...prev, newMsg]);
    setLoading(true);

    try {
      const token = localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token');
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          message: userText,
          target_language: targetLanguage,
          learning_level: learningLevel,
          conversation_id: conversationId,
          mode: activeMode
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setConversationId(data.conversation_id);
        setMessages((prev) => [...prev, data.message]);
      } else {
        setMessages((prev) => [
          ...prev,
          {
            id: 'err-' + Date.now(),
            role: 'assistant',
            content: data.message || "Xatolik yuz berdi. Iltimos qayta urinib ko'ring."
          }
        ]);
      }
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: 'err-' + Date.now(),
          role: 'assistant',
          content: "Server bilan bog'lanishda xatolik yuz berdi."
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setMessages([welcomeMessage]);
    setConversationId(null);
  };

  // Quick action suggestions
  const conversationSuggestions = [
    {
      label: "Bugungi kunim haqida",
      prompt: "Assalomu alaykum! Bugungi kunim qanday o'tgani haqida suhbatlashamiz."
    },
    {
      label: "5 ta yangi so'z",
      prompt: `Menga ${targetLanguage} tilida (${learningLevel} daraja) kundalik muloqot uchun eng muhim 5 ta yangi so'z va ularga misollar bering.`
    },
    {
      label: "Grammatik tekshiruv",
      prompt: "Men bir gap yozaman, siz undagi grammatik xatolarni topib tushuntirib bering."
    },
    {
      label: "IELTS / CEFR mashqi",
      prompt: "Keling, suhbat bo'yicha imtihon savol-javob mashg'ulotini o'tkazamiz."
    }
  ];

  return (
    <div className="min-h-screen py-8 bg-[#F7F8FC] dark:bg-[#0B1020] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        {/* Top AI Control Bar */}
        <div className="bg-white dark:bg-[#12182B] rounded-2xl p-4 sm:p-5 border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B7CFF] text-white flex items-center justify-center shadow-md shadow-[#635BFF]/25">
              <Bot className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-[#171A2B] dark:text-white flex items-center gap-2">
                LISON AI Ustoz
                <span className="flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Faol
                </span>
              </h1>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD]">
                24/7 aqlli nutq, grammatika va individual til repetitori
              </p>
            </div>
          </div>

          {/* Language & Level Controls */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center bg-[#F7F8FC] dark:bg-[#1A223B] rounded-xl px-2.5 py-1 border border-[#E6E8F0] dark:border-[#1F2840]">
              <Languages className="w-3.5 h-3.5 text-[#635BFF] dark:text-[#8B7CFF] mr-1.5" />
              <select
                value={targetLanguage}
                onChange={(e) => setTargetLanguage(e.target.value)}
                className="bg-transparent text-xs font-bold text-[#171A2B] dark:text-white outline-none cursor-pointer"
              >
                <option value="English">🇬🇧 English</option>
                <option value="Russian">🇷🇺 Русский</option>
                <option value="Korean">🇰🇷 한국어</option>
                <option value="Arabic">🇸🇦 العربية</option>
                <option value="German">🇩🇪 Deutsch</option>
                <option value="Uzbek">🇺🇿 O'zbekcha</option>
              </select>
            </div>

            <select
              value={learningLevel}
              onChange={(e) => setLearningLevel(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-[#F7F8FC] dark:bg-[#1A223B] text-xs font-bold text-[#171A2B] dark:text-white border border-[#E6E8F0] dark:border-[#1F2840] outline-none cursor-pointer"
            >
              <option value="A1">A1 (Boshlang'ich)</option>
              <option value="A2">A2 (Elementar)</option>
              <option value="B1">B1 (O'rta)</option>
              <option value="B2">B2 (Yuqori o'rta)</option>
              <option value="C1">C1 (Ilg'or)</option>
            </select>

            <button
              onClick={handleClear}
              className="p-2 text-gray-400 hover:text-red-500 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-800 transition cursor-pointer"
              title="Suhbatni tozalash"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Quick Actions (Grammar, Vocabulary, Speaking, Translation) */}
        {geminiConfigured === false && (
          <div className="p-3.5 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/60 text-amber-800 dark:text-amber-200 text-xs flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <span className="font-bold">Mahalliy Lingvistik Rejim (API kalit ulanmagan):</span>{' '}
              Tashqi Gemini AI kaliti (`GEMINI_API_KEY`) serverga ulanmagan. Hozircha AI Ustoz o&apos;rnatilgan mahalliy lingvistik bazadan foydalanib javob bermoqda.
            </div>
          </div>
        )}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          <button
            onClick={() => setActiveMode('grammar')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === 'grammar'
                ? 'bg-[#635BFF]/10 border-[#635BFF] text-[#635BFF] dark:text-[#8B7CFF]'
                : 'bg-white dark:bg-[#12182B] border-[#E6E8F0] dark:border-[#1F2840] text-[#171A2B] dark:text-[#F7F8FC] hover:border-[#635BFF]/30'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] flex items-center justify-center shrink-0">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Grammar</p>
              <p className="text-[10px] text-[#5A627A] dark:text-[#9DA6BD]">Xatolarni tekshirish</p>
            </div>
          </button>

          <button
            onClick={() => setActiveMode('vocabulary')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === 'vocabulary'
                ? 'bg-[#635BFF]/10 border-[#635BFF] text-[#635BFF] dark:text-[#8B7CFF]'
                : 'bg-white dark:bg-[#12182B] border-[#E6E8F0] dark:border-[#1F2840] text-[#171A2B] dark:text-[#F7F8FC] hover:border-[#635BFF]/30'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Vocabulary</p>
              <p className="text-[10px] text-[#5A627A] dark:text-[#9DA6BD]">Yangi so'z boyligi</p>
            </div>
          </button>

          <a
            href="/speaking"
            onClick={(e) => {
              e.preventDefault();
              window.history.pushState({}, '', '/speaking');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }}
            className="p-3 rounded-xl border border-amber-500/30 bg-amber-500/5 hover:bg-amber-500/10 text-[#171A2B] dark:text-[#F7F8FC] text-left transition cursor-pointer flex items-center gap-2.5"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/15 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight flex items-center gap-1">
                Speaking <ArrowRight className="w-3 h-3 text-amber-500" />
              </p>
              <p className="text-[10px] text-[#5A627A] dark:text-[#9DA6BD]">Nutq studiyasi</p>
            </div>
          </a>

          <button
            onClick={() => setActiveMode('writing')}
            className={`p-3 rounded-xl border text-left transition cursor-pointer flex items-center gap-2.5 ${
              activeMode === 'writing'
                ? 'bg-[#635BFF]/10 border-[#635BFF] text-[#635BFF] dark:text-[#8B7CFF]'
                : 'bg-white dark:bg-[#12182B] border-[#E6E8F0] dark:border-[#1F2840] text-[#171A2B] dark:text-[#F7F8FC] hover:border-[#635BFF]/30'
            }`}
          >
            <div className="w-8 h-8 rounded-lg bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs font-bold leading-tight">Translation</p>
              <p className="text-[10px] text-[#5A627A] dark:text-[#9DA6BD]">Insho & Tarjima</p>
            </div>
          </button>
        </div>

        {/* Conversation Suggestions Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] font-bold text-[#5A627A] dark:text-[#9DA6BD] shrink-0">Tavsiyalar:</span>
          {conversationSuggestions.map((item, index) => (
            <button
              key={index}
              onClick={() => handleSend(undefined, item.prompt)}
              className="px-3 py-1 rounded-full text-xs font-medium bg-white dark:bg-[#12182B] text-[#5A627A] dark:text-[#9DA6BD] hover:text-[#635BFF] dark:hover:text-[#8B7CFF] border border-[#E6E8F0] dark:border-[#1F2840] hover:border-[#635BFF]/40 whitespace-nowrap transition cursor-pointer"
            >
              {item.label}
            </button>
          ))}
        </div>

        {/* Chat Messages Card */}
        <div className="bg-white dark:bg-[#12182B] rounded-2xl border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex flex-col h-[560px] overflow-hidden">
          {/* Scrollable messages container */}
          <div className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B7CFF] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                    <Bot className="w-4 h-4" />
                  </div>
                )}

                <div
                  className={`max-w-2xl rounded-2xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-[#635BFF] to-[#7B6EFF] text-white rounded-tr-none shadow-md shadow-[#635BFF]/15'
                      : 'bg-[#F7F8FC] dark:bg-[#0E1426] text-[#171A2B] dark:text-[#F7F8FC] rounded-tl-none border border-[#E6E8F0] dark:border-[#1F2840]'
                  }`}
                >
                  <p>{msg.content}</p>

                  {/* Corrections Box if any */}
                  {msg.corrections && (
                    <div className="mt-3 p-3 bg-white dark:bg-[#12182B] rounded-xl border border-emerald-500/20 text-xs space-y-1">
                      <p className="font-bold text-emerald-600 dark:text-emerald-400">
                        ✅ To'g'ri shakli: "{msg.corrections.corrected}"
                      </p>
                      <p className="text-[#5A627A] dark:text-[#9DA6BD]">
                        💡 {msg.corrections.explanation}
                      </p>
                    </div>
                  )}

                  {/* Assistant Message Actions (TTS & Copy) */}
                  {msg.role === 'assistant' && (
                    <div className="mt-2.5 pt-2 border-t border-[#E6E8F0] dark:border-[#1F2840] flex items-center justify-end gap-1 text-[#5A627A] dark:text-[#9DA6BD]">
                      <button
                        onClick={() => handleCopy(msg.id, msg.content)}
                        className="p-1 hover:text-[#635BFF] rounded transition cursor-pointer"
                        title="Nusxa olish"
                      >
                        {copiedId === msg.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                      <button
                        onClick={() => playTTS(msg.content)}
                        className="p-1 hover:text-[#635BFF] rounded transition cursor-pointer"
                        title="Ovozli eshitish"
                      >
                        <Volume2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex items-start gap-3 justify-start">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#635BFF] to-[#8B7CFF] text-white flex items-center justify-center shrink-0 shadow-sm mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
                <div className="bg-[#F7F8FC] dark:bg-[#0E1426] rounded-2xl p-3.5 rounded-tl-none border border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2 text-xs text-[#5A627A] dark:text-[#9DA6BD]">
                  <span className="flex gap-1 items-center">
                    <span className="w-2 h-2 rounded-full bg-[#635BFF] animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#8B7CFF] animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 rounded-full bg-[#635BFF] animate-bounce" style={{ animationDelay: '300ms' }} />
                  </span>
                  <span className="ml-1 font-medium">LISON AI tahlil qilmoqda...</span>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input Footer */}
          <form
            onSubmit={handleSend}
            className="p-3.5 bg-white dark:bg-[#12182B] border-t border-[#E6E8F0] dark:border-[#1F2840] flex items-center gap-2"
          >
            <button
              type="button"
              onClick={toggleListening}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isListening
                  ? 'bg-red-500 text-white border-red-500 animate-pulse'
                  : 'bg-[#F7F8FC] dark:bg-[#1A223B] text-[#5A627A] dark:text-[#9DA6BD] border-[#E6E8F0] dark:border-[#1F2840] hover:text-[#635BFF]'
              }`}
              title="Ovoz orqali kiritish"
            >
              {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
            </button>

            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`${targetLanguage} tilida yozing yoki mikrofonda gapiring...`}
              className="flex-1 px-4 py-2.5 bg-[#F7F8FC] dark:bg-[#0E1426] border border-[#E6E8F0] dark:border-[#1F2840] rounded-xl text-xs sm:text-sm text-[#171A2B] dark:text-white focus:outline-none focus:ring-2 focus:ring-[#635BFF]"
            />

            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="px-4 py-2.5 bg-gradient-to-r from-[#635BFF] to-[#8B7CFF] hover:from-[#544BFF] hover:to-[#7B6EFF] text-white font-bold text-xs rounded-xl shadow-md shadow-[#635BFF]/20 transition disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Yuborish</span>
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
