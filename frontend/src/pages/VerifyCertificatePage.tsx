import React, { useState, useEffect } from 'react';
import { Certificate } from '../types';
import { ShieldCheck, Search, CheckCircle2, XCircle, Award, Download, Printer, ExternalLink } from 'lucide-react';

interface VerifyCertificatePageProps {
  initialCode?: string;
}

export const VerifyCertificatePage: React.FC<VerifyCertificatePageProps> = ({ initialCode }) => {
  const [code, setCode] = useState(initialCode || 'LISON-2026-EN8492');
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState<boolean | null>(null);
  const [certificate, setCertificate] = useState<Certificate | null>(null);
  const [message, setMessage] = useState('');

  const handleVerify = async (certCodeToVerify?: string) => {
    const targetCode = certCodeToVerify || code;
    if (!targetCode.trim()) return;

    setLoading(true);
    try {
      const res = await fetch(`/api/certificates/verify/${encodeURIComponent(targetCode.trim())}`);
      const data = await res.json();
      if (data.success && data.is_valid && data.certificate) {
        setVerified(true);
        setCertificate(data.certificate);
        setMessage(data.message);
      } else {
        setVerified(false);
        setCertificate(null);
        setMessage(data.message || 'Sertifikat topilmadi yoki bekor qilingan.');
      }
    } catch {
      setVerified(false);
      setMessage('Server bilan bog\'lanishda xatolik yuz berdi.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      handleVerify(code);
    }
  }, []);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen py-12 bg-gray-50/50 dark:bg-gray-950 transition-colors">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto space-y-3">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
            <ShieldCheck className="w-3.5 h-3.5" />
            Rasmiy Reestr
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight">
            Sertifikat Haqiqiyligini Tekshirish
          </h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            LISON bitiruvchilariga berilgan har bir rasmiy sertifikat davlat ta'lim standartlariga muvofiq markaziy ma'lumotlar bazasida himoyalangan.
          </p>
        </div>

        {/* Search bar */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 border border-gray-100 dark:border-gray-800 shadow-sm">
          <form
            onSubmit={(e) => { e.preventDefault(); handleVerify(); }}
            className="flex flex-col sm:flex-row gap-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-4 top-3.5 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                placeholder="Masalan: LISON-2026-EN8492"
                className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-2xl text-sm font-mono uppercase focus:outline-none focus:ring-2 focus:ring-primary-500 text-gray-900 dark:text-white"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-2xl shadow-md transition disabled:opacity-50"
            >
              {loading ? 'Tekshirilmoqda...' : 'Tekshirish'}
            </button>
          </form>
        </div>

        {/* Verification Result Card */}
        {verified === true && certificate && (
          <div className="space-y-6 animate-fade-in">
            {/* Status notification banner */}
            <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 flex items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <CheckCircle2 className="w-6 h-6 text-emerald-600 dark:text-emerald-400 shrink-0" />
                <div>
                  <h4 className="text-sm font-bold text-emerald-900 dark:text-emerald-200">
                    Sertifikat Tasdiqlangan va Haqiqiy
                  </h4>
                  <p className="text-xs text-emerald-700 dark:text-emerald-300">
                    {message}
                  </p>
                </div>
              </div>

              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Chop Etish / PDF</span>
              </button>
            </div>

            {/* Official Printable Certificate Mockup */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl p-8 sm:p-14 border-4 border-double border-amber-300 dark:border-amber-800/80 shadow-2xl space-y-8 text-center overflow-hidden">
              {/* Watermark logo */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-5 pointer-events-none">
                <Award className="w-[450px] h-[450px] text-primary-500" />
              </div>

              {/* Certificate Header */}
              <div className="space-y-2">
                <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-primary-600 to-indigo-600 text-white flex items-center justify-center mx-auto shadow-lg mb-4">
                  <Award className="w-8 h-8" />
                </div>
                <h3 className="text-xs font-extrabold uppercase tracking-widest text-primary-600 dark:text-primary-400">
                  LISON & Oliy Ta'lim Innovatsiyalari Markazi
                </h3>
                <h2 className="text-3xl sm:text-4xl font-serif font-black tracking-wide text-gray-900 dark:text-white uppercase">
                  Rasmiy Malaka Sertifikati
                </h2>
                <p className="text-xs text-gray-400 uppercase tracking-widest">
                  Certificate of Achievement & Language Proficiency
                </p>
              </div>

              {/* Student Name */}
              <div className="py-4 border-y border-gray-100 dark:border-gray-800 space-y-2 max-w-lg mx-auto">
                <p className="text-xs text-gray-500">Ushbu sertifikat tasdiqlaydi-ki:</p>
                <h3 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white underline decoration-amber-400 decoration-2 underline-offset-8">
                  {certificate.student_name}
                </h3>
              </div>

              {/* Course Title and Completion */}
              <div className="space-y-2 max-w-xl mx-auto">
                <p className="text-xs text-gray-600 dark:text-gray-300">
                  quyidagi o'quv dasturi bo'yicha barcha nazariy va amaliy modullarni muvaffaqiyatli yakunlab, yakuniy imtihonni a'lo baholarga topshirdi:
                </p>
                <h4 className="text-lg sm:text-xl font-extrabold text-primary-600 dark:text-primary-400">
                  "{certificate.course_title}"
                </h4>
              </div>

              {/* Signatures & QR Code */}
              <div className="pt-8 grid grid-cols-1 sm:grid-cols-3 gap-6 items-end border-t border-gray-100 dark:border-gray-800 text-xs">
                {/* Issue date & ID */}
                <div className="text-left space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Sertifikat ID:</p>
                  <p className="font-mono font-bold text-gray-900 dark:text-white">{certificate.id}</p>
                  <p className="text-[10px] text-gray-400 uppercase font-semibold mt-2">Berilgan sana:</p>
                  <p className="font-bold text-gray-700 dark:text-gray-300">{certificate.issue_date?.slice(0, 10)}</p>
                </div>

                {/* QR Code */}
                <div className="flex flex-col items-center">
                  <div className="w-24 h-24 bg-white p-2 rounded-2xl shadow-md border border-gray-200">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(certificate.verification_url)}`}
                      alt="Verification QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <span className="text-[9px] text-gray-400 mt-1 uppercase font-semibold">Haqiqiylik QR Kodi</span>
                </div>

                {/* Authority Seal */}
                <div className="text-right space-y-1">
                  <p className="text-[10px] text-gray-400 uppercase font-semibold">Beruvchi Muassasa:</p>
                  <p className="font-bold text-gray-900 dark:text-white leading-tight">
                    {certificate.issued_by}
                  </p>
                  <div className="inline-block mt-1 px-2 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 font-bold text-[10px]">
                    Davlat Standartiga Muvofiq
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {verified === false && (
          <div className="p-8 bg-red-50 dark:bg-red-950/30 rounded-3xl border border-red-200 dark:border-red-900/50 text-center space-y-3 animate-fade-in">
            <XCircle className="w-12 h-12 text-red-500 mx-auto" />
            <h3 className="text-base font-bold text-red-900 dark:text-red-200">
              Sertifikat Topilmadi
            </h3>
            <p className="text-xs text-red-700 dark:text-red-300 max-w-md mx-auto">
              {message} Iltimos, seriya raqamini xatosiz kiritganingizni tekshirib ko'ring.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
