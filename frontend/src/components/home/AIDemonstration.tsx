import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Bot, Send, Sparkles, CheckCircle2, ArrowRight, CornerDownLeft } from 'lucide-react';

interface AIDemonstrationProps {
  navigate: (path: string) => void;
}

export const AIDemonstration: React.FC<AIDemonstrationProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const [input, setInput] = useState('I goes to school every day');
  const [response, setResponse] = useState<string | null>(
    `📌 **Grammatik Tahlil:**\n\nJumlangizda 'I' (men) olmoshi bilan fe'lga '-es' qo'shilmaydi. Present Simple qoidasiga ko'ra, faqat He/She/It shaxslarida fe'l oxiriga -s/-es qo'shiladi.\n\n✅ **To'g'ri shakli:** *"I go to school every day."*\n💡 **Tavsiya:** Yana bir misol: "They go to work", lekin "He goes to school".`
  );
  const [loading, setLoading] = useState(false);

  const samplePrompts = [
    'I goes to school every day',
    'She do not like coffee',
    'Present Perfect va Past Simple farqi',
    'TOPIK imtihoni uchun 5 ta muhim so\'z'
  ];

  const handleTest = async (testText?: string) => {
    const textToSubmit = testText || input;
    if (!textToSubmit.trim()) return;

    setLoading(true);
    try {
      const res = await fetch('/api/ai/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('lison_token') || localStorage.getItem('ziyo_token') || ''}`
        },
        body: JSON.stringify({
          message: textToSubmit,
          target_language: 'English',
          learning_level: 'A1',
          mode: 'grammar'
        })
      });

      const data = await res.json();
      if (data.success && data.message) {
        setResponse(data.message.content);
      } else {
        setResponse(`📌 **Tahlil:** Jumlada xatolik topildi.\n✅ **To'g'ri shakli:** "I go to school every day."\n💡 **Qoida:** 'I' olmoshida fe'l o'zgarmaydi.`);
      }
    } catch {
      setResponse(`📌 **Tahlil:** Jumlada xatolik topildi.\n✅ **To'g'ri shakli:** "I go to school every day."\n💡 **Qoida:** 'I' olmoshida fe'l o'zgarmaydi.`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <section className="py-24 bg-white dark:bg-gray-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative rounded-3xl overflow-hidden bg-gradient-to-br from-indigo-900 via-primary-950 to-gray-950 text-white p-8 sm:p-12 lg:p-16 shadow-2xl border border-primary-500/20">
          {/* Background shapes */}
          <div className="absolute top-0 right-0 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left info */}
            <div className="lg:col-span-5 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-500/20 text-primary-300 text-xs font-bold border border-primary-400/30">
                <Bot className="w-4 h-4 text-emerald-400" />
                Interaktiv AI Tajribasi
              </div>
              <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
                {t('aidemo.title')}
              </h2>
              <p className="text-sm sm:text-base text-gray-300 leading-relaxed">
                {t('aidemo.subtitle')}. O'zbek tilida muloyim tushuntirish, qoidalar tahlili va amaliy misollar bilan tillarni oson o'zlashtiring.
              </p>

              {/* Sample pills */}
              <div className="space-y-2 pt-2">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider">
                  Sinab ko'rish uchun tanlang:
                </p>
                <div className="flex flex-wrap gap-2">
                  {samplePrompts.map((p, idx) => (
                    <button
                      key={idx}
                      onClick={() => { setInput(p); handleTest(p); }}
                      className="text-xs px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-gray-200 border border-white/10 transition"
                    >
                      "{p}"
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-4">
                <button
                  onClick={() => navigate('/ai-teacher')}
                  className="inline-flex items-center gap-2 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition"
                >
                  <span>To'liq AI Ustoz interfeysini ochish</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Right Interactive Mock Chat Box */}
            <div className="lg:col-span-7 bg-gray-900/90 rounded-2xl p-6 border border-gray-700/60 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-gray-800">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-primary-600 flex items-center justify-center text-white">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-bold text-white">LISON AI Ustoz</p>
                    <p className="text-[10px] text-emerald-400 font-medium">Onlayn • 24/7 faol</p>
                  </div>
                </div>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-white/10 text-gray-300">
                  Dual-Engine Tutor
                </span>
              </div>

              {/* Chat Message Box */}
              <div className="space-y-3 min-h-[160px] max-h-[220px] overflow-y-auto pr-1">
                {/* User query */}
                <div className="flex justify-end">
                  <div className="bg-primary-600 text-white text-xs px-4 py-2.5 rounded-2xl rounded-tr-none max-w-sm">
                    {input}
                  </div>
                </div>

                {/* AI Response */}
                <div className="flex justify-start">
                  <div className="bg-gray-800 text-gray-200 text-xs px-4 py-3 rounded-2xl rounded-tl-none max-w-md border border-gray-700/60 whitespace-pre-wrap leading-relaxed">
                    {loading ? (
                      <div className="flex items-center gap-2 text-gray-400">
                        <Sparkles className="w-4 h-4 animate-spin text-primary-400" />
                        <span>AI tahlil qilmoqda...</span>
                      </div>
                    ) : (
                      response
                    )}
                  </div>
                </div>
              </div>

              {/* Input Form */}
              <div className="pt-2">
                <form
                  onSubmit={(e) => { e.preventDefault(); handleTest(); }}
                  className="flex gap-2"
                >
                  <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Biror jumla yozing..."
                    className="flex-1 px-4 py-2.5 text-xs bg-gray-800 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-primary-500"
                  />
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-bold text-xs rounded-xl flex items-center gap-1.5 transition disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Tekshirish</span>
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
