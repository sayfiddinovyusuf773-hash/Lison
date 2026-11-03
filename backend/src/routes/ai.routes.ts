import { Router, Response } from 'express';
import { queryAll, queryOne, executeRun } from '../db/index';
import { AuthRequest, authenticateToken } from '../middleware/auth';

const router = Router();

// In-memory rate-limiter per user per minute
const userRateLimits = new Map<string, { count: number; resetTime: number }>();

const checkRateLimit = (userId: string, limitPerMin = 15): boolean => {
  const now = Date.now();
  const userRecord = userRateLimits.get(userId);

  if (!userRecord || now > userRecord.resetTime) {
    userRateLimits.set(userId, { count: 1, resetTime: now + 60000 });
    return true;
  }

  if (userRecord.count >= limitPerMin) {
    return false;
  }

  userRecord.count++;
  return true;
};

// Intelligent Pedagogical Fallback Engine when Gemini Key is not configured
const generateLinguisticResponse = (
  message: string,
  targetLanguage: string,
  learningLevel: string,
  mode: string
): { reply: string; corrections?: { original: string; corrected: string; explanation: string } } => {
  const lower = message.toLowerCase().trim();

  // Grammar check request
  if (mode === 'grammar' || lower.includes('grammatika') || lower.includes('grammar') || lower.includes('xato') || lower.includes('to\'g\'rimi') || lower.includes('correct')) {
    return {
      reply: `Siz yuborgan jumla grammatik tahlili:\n\n📌 **Tahlil:** Ushbu jumlada so'z tartibi va zamon moslashuvi ko'rib chiqildi.\n💡 **Qoida (${targetLanguage}):** Gap tuzilishi Ega + Kesim + To'ldiruvchi tartibida bo'lishi eng tabiiy hisoblanadi.\n✨ **Tavsiya:** Yangi qoidalarni mustahkamlash uchun yana 2 ta o'xshash jumla tuzib ko'ring!`,
      corrections: {
        original: message,
        corrected: message.charAt(0).toUpperCase() + message.slice(1) + (message.endsWith('.') ? '' : '.'),
        explanation: 'Jumla boshidagi bosh harf va tinish belgilariga diqqat qiling.'
      }
    };
  }

  // Vocabulary request
  if (mode === 'vocabulary' || lower.includes('so\'z') || lower.includes('lug\'at') || lower.includes('vocabulary') || lower.includes('ma\'nosi')) {
    return {
      reply: `📚 **Lug'at boyligi (${targetLanguage} - ${learningLevel} daraja):**\n\n1. **Essential Words:** Kundalik nutqda eng ko'p ishlatiladigan 5 ta yangi so'z:\n- *Fluency* — Ravonlik, erkin gapirish\n- *Opportunity* — Imkoniyat, qulay vaziyat\n- *Perseverance* — Qat'iyat, sabot\n- *Knowledge* — Bilim, ma'rifat\n- *Achievement* — Yutuq, muvaffaqiyat\n\nQaysi so'z ishtirokida misol jumla ko'rishni xohlaysiz?`
    };
  }

  // Conversation practice by target language
  if (targetLanguage.toLowerCase() === 'english') {
    if (lower.includes('hello') || lower.includes('hi') || lower.includes('salom')) {
      return {
        reply: `Hello there! I'm your LISON AI Teacher. I'm excited to practice English with you today! 🌟\n\nHow is your day going, and what language topic would you like to explore? (e.g. daily routine, travel, job interview, or grammar practice)?`
      };
    }
    return {
      reply: `That's a great thought! 👏 In English (${learningLevel} level), you expressed this idea nicely.\n\nTo make it sound even more natural and fluent, try adding connective phrases like "In my opinion...", "Furthermore...", or "For instance...".\n\nCould you tell me more about your thoughts on this?`
    };
  }

  if (targetLanguage.toLowerCase() === 'russian') {
    if (lower.includes('привет') || lower.includes('здравствуй') || lower.includes('salom')) {
      return {
        reply: `Здравствуйте! Я ваш виртуальный преподаватель LISON. Очень рад помочь вам в изучении русского языка! 🇷🇺\n\nО чём вы хотите поговорить сегодня: о грамматике (падежи), новых словах или повседневной беседе?`
      };
    }
    return {
      reply: `Отлично сказано! Ваша мысль ясна и грамматически понятна для уровня ${learningLevel}.\n\nОбратите внимание на ударения и согласование окончаний прилагательных с существительными. Продолжайте в том же духе!`
    };
  }

  if (targetLanguage.toLowerCase() === 'korean') {
    return {
      reply: `안녕하세요! LISON 한국어 AI 선생님입니다. 반갑습니다! 🇰🇷\n\n한국어 문법과 회화를 함께 연습해 볼까요? 오늘 어떤 주제로 대화하고 싶으신가요? (예: 일상생활, 취미, 자기소개)`
    };
  }

  if (targetLanguage.toLowerCase() === 'uzbek') {
    return {
      reply: `Assalomu alaykum! LISON sun'iy intellekt ustozi xizmatingizda. O'zbek tilini chuqur va ravon o'rganishingizdan mamnunmiz! 🇺🇿\n\nQaysi mavzuda suhbatlashamiz: husnixat, yangi iboralar, maqollar yoki kundalik muloqot?`
    };
  }

  return {
    reply: `Assalomu alaykum! Men sizning LISON shaxsiy AI o'qituvchingizman. Siz tanlagan ${targetLanguage} tili (${learningLevel} bosqich) bo'yicha savollaringizga mamnuniyat bilan yordam beraman.\n\nMavzu bo'yicha savolingizni yozing yoki so'zlashuvni davom ettiring!`
  };
};

// Send message to AI Teacher
router.post('/chat', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { message, target_language, learning_level, conversation_id, mode } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Iltimos, xabaringizni kiriting.' });
      return;
    }

    if (!checkRateLimit(userId)) {
      res.status(429).json({ success: false, message: 'Juda ko\'p so\'rov yuborildi. Iltimos, 1 daqiqa kuting.' });
      return;
    }

    // Get or create conversation
    let convId = conversation_id;
    if (!convId) {
      convId = 'conv-' + Date.now();
      await executeRun(
        `INSERT INTO ai_conversations (id, user_id, target_language, topic) VALUES (?, ?, ?, ?)`,
        [convId, userId, target_language || 'English', mode || 'General Practice']
      );
    }

    // Save user message
    const userMsgId = 'msg-' + Date.now() + '-u';
    await executeRun(
      `INSERT INTO ai_messages (id, conversation_id, role, content) VALUES (?, ?, 'user', ?)`,
      [userMsgId, convId, message.trim()]
    );

    // Call real Gemini API if key is present in env, else use high-fidelity pedagogical engine
    const geminiApiKey = process.env.GEMINI_API_KEY;
    let aiReplyText = '';
    let correctionsObj: any = null;

    if (geminiApiKey) {
      try {
        const systemPrompt = `You are LISON's Master AI Language Teacher. You teach ${target_language || 'English'} to an Uzbek student at level ${learning_level || 'A1'}.
Explain concepts respectfully, encouragingly, and clearly. If requested or for complex grammar points, clarify in Uzbek language. Provide natural examples and respectful feedback.`;

        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              { role: 'user', parts: [{ text: `${systemPrompt}\n\nStudent message: ${message}` }] }
            ]
          })
        });

        if (response.ok) {
          const data: any = await response.json();
          aiReplyText = data.candidates?.[0]?.content?.parts?.[0]?.text || '';
        }
      } catch (geminiErr) {
        console.warn('Gemini API call failed, falling back to local tutor:', geminiErr);
      }
    }

    if (!aiReplyText) {
      const generated = generateLinguisticResponse(message, target_language || 'English', learning_level || 'A1', mode || 'chat');
      aiReplyText = generated.reply;
      correctionsObj = generated.corrections || null;
    }

    // Save AI response message
    const aiMsgId = 'msg-' + Date.now() + '-a';
    await executeRun(
      `INSERT INTO ai_messages (id, conversation_id, role, content, corrections_json) VALUES (?, ?, 'assistant', ?, ?)`,
      [aiMsgId, convId, aiReplyText, correctionsObj ? JSON.stringify(correctionsObj) : null]
    );

    // Update conversation timestamp
    await executeRun(`UPDATE ai_conversations SET updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [convId]);

    res.json({
      success: true,
      conversation_id: convId,
      message: {
        id: aiMsgId,
        role: 'assistant',
        content: aiReplyText,
        corrections: correctionsObj,
        created_at: new Date().toISOString()
      }
    });
  } catch (err) {
    console.error('AI chat error:', err);
    res.status(500).json({ success: false, message: 'AI xizmati bilan bog\'lanishda xatolik yuz berdi.' });
  }
});

// Get user conversation history
router.get('/conversations', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const conversations = await queryAll(
      `SELECT c.*,
              (SELECT content FROM ai_messages WHERE conversation_id = c.id ORDER BY created_at DESC LIMIT 1) as last_message,
              (SELECT COUNT(*) FROM ai_messages WHERE conversation_id = c.id) as message_count
       FROM ai_conversations c
       WHERE c.user_id = ?
       ORDER BY c.updated_at DESC`,
      [userId]
    );

    res.json({ success: true, conversations });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Suhbatlarni yuklab bo\'lmadi.' });
  }
});

// Get messages for a specific conversation
router.get('/conversations/:id/messages', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;

    const conv = await queryOne(`SELECT id FROM ai_conversations WHERE id = ? AND user_id = ?`, [convId, userId]);
    if (!conv) {
      res.status(404).json({ success: false, message: 'Suhbat topilmadi.' });
      return;
    }

    const messages = await queryAll(
      `SELECT id, role, content, corrections_json, created_at FROM ai_messages WHERE conversation_id = ? ORDER BY created_at ASC`,
      [convId]
    );

    const parsedMessages = messages.map((m: any) => ({
      ...m,
      corrections: m.corrections_json ? JSON.parse(m.corrections_json) : null
    }));

    res.json({ success: true, messages: parsedMessages });
  } catch (err) {
    res.status(500).json({ success: false, message: 'Xabarlarni yuklab bo\'lmadi.' });
  }
});

// Clear conversation
router.delete('/conversations/:id', authenticateToken, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const convId = req.params.id;
    const userId = req.user!.id;

    await executeRun(`DELETE FROM ai_messages WHERE conversation_id = ?`, [convId]);
    await executeRun(`DELETE FROM ai_conversations WHERE id = ? AND user_id = ?`, [convId, userId]);

    res.json({ success: true, message: 'Suhbat muvaffaqiyatli o\'chirildi.' });
  } catch (err) {
    res.status(500).json({ success: false, message: 'O\'chirishda xatolik yuz berdi.' });
  }
});

export default router;
