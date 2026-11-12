"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendPasswordResetEmail = exports.sendVerificationEmail = exports.isEmailConfigured = void 0;
const isEmailConfigured = () => {
    return Boolean(process.env.RESEND_API_KEY && process.env.RESEND_API_KEY.trim());
};
exports.isEmailConfigured = isEmailConfigured;
const sendViaResend = async (to, subject, html) => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
        console.info(`[EMAIL] Skipped sending to ${to} (RESEND_API_KEY not configured)`);
        return {
            sent: false,
            configured: false,
            provider: 'none',
            error: 'Email yuborish xizmati (RESEND_API_KEY) serverda sozlanmagan.'
        };
    }
    const from = process.env.EMAIL_FROM || 'LISON Platform <onboarding@resend.dev>';
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 10000);
    try {
        const res = await fetch('https://api.resend.com/emails', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            signal: controller.signal,
            body: JSON.stringify({
                from,
                to: [to],
                subject,
                html
            })
        });
        if (!res.ok) {
            const errText = await res.text().catch(() => '');
            console.error(`[EMAIL] Delivery failed to ${to}: status=${res.status}`);
            return {
                sent: false,
                configured: true,
                provider: 'resend',
                error: `Email yuborishda xatolik (${res.status}). ${errText ? 'Tafsilot tekshirilsin.' : ''}`.trim()
            };
        }
        console.info(`[EMAIL] Verification/Reset email delivered to ${to}`);
        return { sent: true, configured: true, provider: 'resend' };
    }
    catch (err) {
        console.error(`[EMAIL] Delivery error to ${to}:`, err?.name || 'error');
        return {
            sent: false,
            configured: true,
            provider: 'resend',
            error: "Email serveriga ulanishda vaqt tugadi yoki xatolik yuz berdi."
        };
    }
    finally {
        clearTimeout(timeoutId);
    }
};
const sendVerificationEmail = async (to, code) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0B1020; color: #F7F8FC; border-radius: 16px;">
      <h2 style="color: #8B7CFF; margin-top: 0;">LISON — Email Tasdiqlash</h2>
      <p>Salom! LISON hisobingizning email manzilini tasdiqlash uchun quyidagi 6 xonali bir martalik koddan foydalaning:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 24px; background: #141B33; border-radius: 12px; text-align: center; color: #00D4B2; margin: 20px 0;">
        ${code}
      </div>
      <p style="font-size: 13px; color: #9DA6BD;">Ushbu kod 15 daqiqa davomida amal qiladi. Agar bu so'rovni siz yubormagan bo'lsangiz, xabarni e'tiborsiz qoldiring.</p>
    </div>
  `;
    return sendViaResend(to, 'LISON — Email tasdiqlash kodi', html);
};
exports.sendVerificationEmail = sendVerificationEmail;
const sendPasswordResetEmail = async (to, code) => {
    const html = `
    <div style="font-family: Arial, sans-serif; max-width: 520px; margin: 0 auto; padding: 24px; background: #0B1020; color: #F7F8FC; border-radius: 16px;">
      <h2 style="color: #8B7CFF; margin-top: 0;">LISON — Parolni Tiklash</h2>
      <p>Parolingizni yangilash uchun quyidagi bir martalik tasdiqlash kodini kiriting:</p>
      <div style="font-size: 32px; font-weight: bold; letter-spacing: 6px; padding: 16px 24px; background: #141B33; border-radius: 12px; text-align: center; color: #FBBF24; margin: 20px 0;">
        ${code}
      </div>
      <p style="font-size: 13px; color: #9DA6BD;">Kod 15 daqiqa ichida amal qiladi va faqat bir marta ishlatiladi.</p>
    </div>
  `;
    return sendViaResend(to, 'LISON — Parolni tiklash kodi', html);
};
exports.sendPasswordResetEmail = sendPasswordResetEmail;
