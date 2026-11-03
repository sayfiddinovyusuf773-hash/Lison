import React, { useEffect, useState } from 'react';
import { Trophy, Medal, Flame, Zap, ShieldCheck, Users, BookOpen, CheckCircle2, Award, BarChart3 } from 'lucide-react';

export const LeaderboardPage: React.FC = () => {
  const [leaderboard, setLeaderboard] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await fetch('/api/dashboard/leaderboard');
        const data = await res.json();
        if (data.success && data.leaderboard) {
          setLeaderboard(data.leaderboard);
        }
      } catch (err) {
        console.error('Fetch leaderboard error:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchLeaderboard();
  }, []);

  return (
    <div className="min-h-screen py-10 bg-[#F7F8FC] dark:bg-[#0B1020] transition-colors duration-300">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center max-w-2xl mx-auto space-y-2.5">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] text-xs font-bold">
            <BarChart3 className="w-3.5 h-3.5" />
            Umumiy Statistika & Reyting
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-[#171A2B] dark:text-white tracking-tight">
            Ta'lim Natijalari va Eng Faol O'rganuvchilar
          </h1>
          <p className="text-sm text-[#5A627A] dark:text-[#9DA6BD]">
            LISON platformasining ta'lim ko'rsatkichlari, kurs natijalari va yetakchi o'quvchilar ro'yxati.
          </p>
        </div>

        {/* Global Platform Statistics Metrics */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-[#12182B] rounded-2xl p-5 border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-[#635BFF]/10 text-[#635BFF] dark:text-[#8B7CFF] flex items-center justify-center shrink-0">
              <Users className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#171A2B] dark:text-white">52,400+</p>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] font-medium">Faol O'quvchilar</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12182B] rounded-2xl p-5 border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
              <BookOpen className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#171A2B] dark:text-white">12 ta</p>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] font-medium">Til Kurslari</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12182B] rounded-2xl p-5 border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#171A2B] dark:text-white">148,000+</p>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] font-medium">Yakunlangan Darslar</p>
            </div>
          </div>

          <div className="bg-white dark:bg-[#12182B] rounded-2xl p-5 border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center shrink-0">
              <Award className="w-6 h-6" />
            </div>
            <div>
              <p className="text-2xl font-black text-[#171A2B] dark:text-white">8,920+</p>
              <p className="text-xs text-[#5A627A] dark:text-[#9DA6BD] font-medium">QR Sertifikatlar</p>
            </div>
          </div>
        </div>

        {/* Podium for top 3 */}
        {leaderboard.length >= 3 && (
          <div className="grid grid-cols-3 gap-3 sm:gap-6 items-end pt-6 pb-2">
            {/* Rank 2 (Silver) */}
            <div className="bg-white dark:bg-[#12182B] rounded-2xl p-4 sm:p-6 border border-[#E6E8F0] dark:border-[#1F2840] text-center shadow-sm order-1">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-2 overflow-hidden border-2 border-slate-300 dark:border-slate-600">
                <img
                  src={leaderboard[1].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[1].first_name)}&background=94a3b8&color=fff`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 text-[10px] font-bold">
                🥈 2-O'rin
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#171A2B] dark:text-white mt-1">
                {leaderboard[1].display_name}
              </h3>
              <p className="text-xs font-black text-[#635BFF] dark:text-[#8B7CFF] mt-1">
                {leaderboard[1].xp_points} XP
              </p>
            </div>

            {/* Rank 1 (Gold) */}
            <div className="bg-gradient-to-b from-amber-500/10 via-white to-white dark:from-amber-950/40 dark:via-[#12182B] dark:to-[#12182B] rounded-2xl p-5 sm:p-7 border-2 border-amber-400 text-center shadow-xl order-2 -translate-y-3">
              <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-2xl mx-auto mb-2 overflow-hidden border-2 border-amber-400 shadow-md">
                <img
                  src={leaderboard[0].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[0].first_name)}&background=f59e0b&color=fff`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-block px-2.5 py-0.5 rounded-full bg-amber-400 text-amber-950 text-xs font-black">
                👑 1-O'rin
              </span>
              <h3 className="text-sm sm:text-base font-extrabold text-[#171A2B] dark:text-white mt-2">
                {leaderboard[0].display_name}
              </h3>
              <p className="text-sm font-black text-amber-500 mt-1">
                {leaderboard[0].xp_points} XP
              </p>
            </div>

            {/* Rank 3 (Bronze) */}
            <div className="bg-white dark:bg-[#12182B] rounded-2xl p-4 sm:p-6 border border-[#E6E8F0] dark:border-[#1F2840] text-center shadow-sm order-3">
              <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl mx-auto mb-2 overflow-hidden border-2 border-amber-700/50">
                <img
                  src={leaderboard[2].avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(leaderboard[2].first_name)}&background=b45309&color=fff`}
                  alt=""
                  className="w-full h-full object-cover"
                />
              </div>
              <span className="inline-block px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 text-[10px] font-bold">
                🥉 3-O'rin
              </span>
              <h3 className="text-xs sm:text-sm font-bold text-[#171A2B] dark:text-white mt-1">
                {leaderboard[2].display_name}
              </h3>
              <p className="text-xs font-black text-[#635BFF] dark:text-[#8B7CFF] mt-1">
                {leaderboard[2].xp_points} XP
              </p>
            </div>
          </div>
        )}

        {/* Full Leaderboard List */}
        <div className="bg-white dark:bg-[#12182B] rounded-2xl border border-[#E6E8F0] dark:border-[#1F2840] shadow-sm overflow-hidden divide-y divide-[#E6E8F0] dark:divide-[#1F2840]">
          {leaderboard.map((u) => (
            <div
              key={u.id}
              className="p-4 sm:px-6 flex items-center justify-between gap-4 hover:bg-[#F7F8FC] dark:hover:bg-[#1A223B] transition"
            >
              <div className="flex items-center gap-4">
                <span className={`w-7 text-center font-black text-sm ${
                  u.rank === 1 ? 'text-amber-500 font-extrabold text-base' :
                  u.rank === 2 ? 'text-gray-400 font-bold' :
                  u.rank === 3 ? 'text-amber-700 font-bold' : 'text-gray-400'
                }`}>
                  #{u.rank}
                </span>

                <img
                  src={u.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(u.first_name)}&background=635BFF&color=fff`}
                  alt=""
                  className="w-10 h-10 rounded-xl object-cover border border-[#E6E8F0] dark:border-[#1F2840]"
                />

                <div>
                  <h4 className="text-sm font-bold text-[#171A2B] dark:text-white">
                    {u.display_name}
                  </h4>
                  <p className="text-[11px] text-[#5A627A] dark:text-[#9DA6BD]">Level {u.level || 1} • {u.preferred_language?.toUpperCase()}</p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-emerald-500" />
                <span className="text-sm font-black text-[#171A2B] dark:text-white">
                  {u.xp_points} XP
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
