import React, { useState } from 'react';
import { useLanguage } from '../../context/LanguageContext';
import { Layers, Mic, CheckCircle2, Volume2, ArrowRight, Sparkles, RefreshCw } from 'lucide-react';

interface InteractiveLearningSectionProps {
  navigate: (path: string) => void;
}

export const InteractiveLearningSection: React.FC<InteractiveLearningSectionProps> = ({ navigate }) => {
  const { t } = useLanguage();
  const [selectedWord, setSelectedWord] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<{ [key: string]: string }>({});

  const englishWords = ['Apple', 'Welcome', 'Student', 'Knowledge'];
  const uzbekWords = ['Xush kelibsiz', 'Olma', 'Bilim', 'Talaba'];
  const correctMatches: { [key: string]: string } = {
    'Apple': 'Olma',
    'Welcome': 'Xush kelibsiz',
    'Student': 'Talaba',
    'Knowledge': 'Bilim'
  };

  const handleWordClick = (enWord: string) => {
    setSelectedWord(enWord);
  };

  const handleUzClick = (uzWord: string) => {
    if (selectedWord && correctMatches[selectedWord] === uzWord) {
      setMatchedPairs((prev) => ({ ...prev, [selectedWord]: uzWord }));
      setSelectedWord(null);
    }
  };

  const isReset = Object.keys(matchedPairs).length === 4;

  return (
    <section className="py-20 bg-[#F7F8FC] dark:bg-[#0B1020] border-t border-[#E6E8F0] dark:border-[#1F2840] transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto mb-14">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold mb-3">
            <Layers className="w-3.5 h-3.5" />
            Amaliy Mashg'ulotlar
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Interaktiv O'rganish Mexanizmi
          </h2>
          <p className="mt-3 text-base text-gray-600 dark:text-gray-400">
            Faqat quruq videoni ko'rish emas, balki real vaqtda so'z juftlash, listening, talaffuz va testlar orqali mustahkamlang.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Card 1: Word Matching Interactive Demo */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-10 h-10 rounded-xl bg-primary-50 dark:bg-primary-950/50 text-primary-600 flex items-center justify-center">
                    <Layers className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-gray-900 dark:text-white">So'zlarni Juftlash Testi</h3>
                    <p className="text-xs text-gray-500">Inglizcha so'zni tanlang, so'ng o'zbekcha tarjimasini bosing</p>
                  </div>
                </div>
                {isReset && (
                  <button
                    onClick={() => setMatchedPairs({})}
                    className="p-1.5 text-xs text-primary-600 hover:bg-primary-50 rounded-lg flex items-center gap-1 font-semibold"
                  >
                    <RefreshCw className="w-3.5 h-3.5" /> Qayta
                  </button>
                )}
              </div>

              {/* Matching board */}
              <div className="grid grid-cols-2 gap-4 my-6">
                {/* Left: English */}
                <div className="space-y-2.5">
                  {englishWords.map((en) => {
                    const isMatched = !!matchedPairs[en];
                    const isSelected = selectedWord === en;
                    return (
                      <button
                        key={en}
                        disabled={isMatched}
                        onClick={() => handleWordClick(en)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : isSelected
                            ? 'bg-primary-600 text-white shadow-md'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{en}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>

                {/* Right: Uzbek */}
                <div className="space-y-2.5">
                  {uzbekWords.map((uz) => {
                    const isMatched = Object.values(matchedPairs).includes(uz);
                    return (
                      <button
                        key={uz}
                        disabled={isMatched}
                        onClick={() => handleUzClick(uz)}
                        className={`w-full py-3 px-4 rounded-xl text-xs font-bold transition flex items-center justify-between ${
                          isMatched
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300'
                            : 'bg-gray-50 dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100'
                        }`}
                      >
                        <span>{uz}</span>
                        {isMatched && <CheckCircle2 className="w-4 h-4 text-emerald-600" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">
                8 xil interaktiv test shakllari darslarda mavjud
              </span>
              <button
                onClick={() => navigate('/courses/crs-eng-a1')}
                className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center gap-1"
              >
                Testlarni ko'rish <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* Card 2: Speaking Studio Preview */}
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-8 border border-gray-100 dark:border-gray-800 shadow-sm flex flex-col justify-between">
            <div>
              <div className="flex items-center gap-2 mb-6">
                <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 flex items-center justify-center">
                  <Mic className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-gray-900 dark:text-white">Jonli Nutq Studiyasi</h3>
                  <p className="text-xs text-gray-500">Talaffuz, grammatika va nutq ravonligini sun'iy intellekt orqali baholash</p>
                </div>
              </div>

              {/* Mock speaking card */}
              <div className="p-5 rounded-2xl bg-gray-50 dark:bg-gray-800/80 border border-gray-100 dark:border-gray-700 space-y-4 my-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    Mavzu: Restoranda Buyurtma Berish
                  </span>
                  <span className="px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold">
                    A1 Daraja
                  </span>
                </div>
                <p className="text-xs text-gray-700 dark:text-gray-300 italic">
                  "Good evening! Could we see the menu please? I would like the grilled chicken and fresh orange juice."
                </p>

                {/* Simulated scores */}
                <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200 dark:border-gray-700 text-center">
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Talaffuz</p>
                    <p className="text-sm font-black text-emerald-600">88%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Grammatika</p>
                    <p className="text-sm font-black text-primary-600">92%</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white dark:bg-gray-900">
                    <p className="text-[10px] text-gray-400 uppercase font-semibold">Lug'at</p>
                    <p className="text-sm font-black text-amber-500">85%</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center justify-between">
              <span className="text-xs text-gray-500 font-medium">Mikrofon orqali to'g'ridan-to'g'ri baholash</span>
              <button
                onClick={() => navigate('/speaking')}
                className="text-xs font-bold text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-1"
              >
                Nutq studiyasiga o'tish <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
