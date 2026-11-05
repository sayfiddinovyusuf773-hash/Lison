export interface GeneratedQuestion {
  question_text: string;
  points: number;
  explanation: string;
  options: {
    text: string;
    is_correct: boolean;
  }[];
}

/**
 * Returns tailored beginner questions (0-dan boshlanadigan savollar)
 * based on the course language and lesson index.
 */
export const getBeginnerQuestionsForLanguage = (
  language: string,
  lessonOrder: number = 1,
  lessonTitle: string = ''
): GeneratedQuestion[] => {
  const lang = (language || 'English').toLowerCase().trim();

  // 1. INGLIZ TILI (English)
  if (lang.includes('ingliz') || lang.includes('english')) {
    if (lessonOrder === 1 || lessonTitle.toLowerCase().includes('alfavit') || lessonTitle.toLowerCase().includes('salom')) {
      return [
        {
          question_text: '"Hello" so\'zining o\'zbekcha ma\'nosi nima?',
          points: 10,
          explanation: '"Hello" ingliz tilida "Salom" degan ma\'noni anglatadi.',
          options: [
            { text: 'Salom', is_correct: true },
            { text: 'Xayr', is_correct: false },
            { text: 'Rahmat', is_correct: false },
            { text: 'Iltimos', is_correct: false }
          ]
        },
        {
          question_text: '"Good morning" iborasi qaysi paytda aytiladi?',
          points: 10,
          explanation: '"Good morning" — "Xayrli tong" degani bo\'lib, ertalab aytiladi.',
          options: [
            { text: 'Ertalab (Xayrli tong)', is_correct: true },
            { text: 'Kechqurun (Xayrli kech)', is_correct: false },
            { text: 'Tunda (Xayrli tun)', is_correct: false },
            { text: 'Xayrlashganda', is_correct: false }
          ]
        },
        {
          question_text: 'O\'zingizni tanishtirishda: "My name is..." qanday tarjima qilinadi?',
          points: 10,
          explanation: '"My name is..." — "Mening ismim..." deganidir.',
          options: [
            { text: 'Mening ismim...', is_correct: true },
            { text: 'Men yashayman...', is_correct: false },
            { text: 'Men talabaman...', is_correct: false },
            { text: 'Mening do\'stim...', is_correct: false }
          ]
        },
        {
          question_text: '"Thank you" so\'zining to\'g\'ri tarjimasi qaysi?',
          points: 10,
          explanation: '"Thank you" minnatdorchilik bildirishda "Rahmat" ma\'nosida ishlatiladi.',
          options: [
            { text: 'Rahmat', is_correct: true },
            { text: 'Kechirasiz', is_correct: false },
            { text: 'Ko\'rishguncha', is_correct: false },
            { text: 'Mayli', is_correct: false }
          ]
        }
      ];
    } else {
      return [
        {
          question_text: 'Ingliz tilida "Book" so\'zi nimani anglatadi?',
          points: 10,
          explanation: '"Book" — Kitob degan ma\'noni bildiradi.',
          options: [
            { text: 'Kitob', is_correct: true },
            { text: 'Daftar', is_correct: false },
            { text: 'Qalam', is_correct: false },
            { text: 'Maktab', is_correct: false }
          ]
        },
        {
          question_text: '"How are you?" savoliga qanday javob beriladi?',
          points: 10,
          explanation: '"How are you?" (Qalaysiz?) savoliga "I am fine, thank you" deb javob beriladi.',
          options: [
            { text: 'I am fine, thank you', is_correct: true },
            { text: 'My name is Ali', is_correct: false },
            { text: 'I am 20 years old', is_correct: false },
            { text: 'Good night', is_correct: false }
          ]
        },
        {
          question_text: '"Goodbye" so\'zining ma\'nosi nima?',
          points: 10,
          explanation: '"Goodbye" — "Xayr" yoki "Ko\'rishguncha" degan ma\'noda.',
          options: [
            { text: 'Xayr', is_correct: true },
            { text: 'Salom', is_correct: false },
            { text: 'Iltimos', is_correct: false },
            { text: 'Kechirasiz', is_correct: false }
          ]
        }
      ];
    }
  }

  // 2. RUS TILI (Russian)
  if (lang.includes('rus') || lang.includes('russian')) {
    return [
      {
        question_text: '"Привет" so\'zining o\'zbekcha ma\'nosi nima?',
        points: 10,
        explanation: '"Привет" norasmiy tarzda "Salom" degani.',
        options: [
          { text: 'Salom', is_correct: true },
          { text: 'Xayr', is_correct: false },
          { text: 'Rahmat', is_correct: false },
          { text: 'Kechirasiz', is_correct: false }
        ]
      },
      {
        question_text: '"Доброе утро" iborasi qachon aytiladi?',
        points: 10,
        explanation: '"Доброе утро" — "Xayrli tong" deganidir.',
        options: [
          { text: 'Ertalab (Xayrli tong)', is_correct: true },
          { text: 'Tushda', is_correct: false },
          { text: 'Kechqurun', is_correct: false },
          { text: 'Tunda', is_correct: false }
        ]
      },
      {
        question_text: '"Как дела?" savolining ma\'nosi nima?',
        points: 10,
        explanation: '"Как дела?" — "Ishlar qalay? / Qalaysiz?" deganidir.',
        options: [
          { text: 'Ishlar qalay? / Qalaysiz?', is_correct: true },
          { text: 'Ismingiz nima?', is_correct: false },
          { text: 'Qayerdansiz?', is_correct: false },
          { text: 'Necha yoshdasiz?', is_correct: false }
        ]
      },
      {
        question_text: '"Спасибо" so\'zining tarjimasi qaysi?',
        points: 10,
        explanation: '"Спасибо" rus tilida "Rahmat" deganidir.',
        options: [
          { text: 'Rahmat', is_correct: true },
          { text: 'Iltimos', is_correct: false },
          { text: 'Salom', is_correct: false },
          { text: 'Marhamat', is_correct: false }
        ]
      }
    ];
  }

  // 3. KOREYS TILI (Korean)
  if (lang.includes('koreys') || lang.includes('korean')) {
    return [
      {
        question_text: '"안녕하세요" (Annyeonghaseyo) qanday ma\'no beradi?',
        points: 10,
        explanation: '"안녕하세요" koreys tilida rasmiy "Salom" yoki "Assalomu alaykum" degani.',
        options: [
          { text: 'Salom / Assalomu alaykum', is_correct: true },
          { text: 'Xayr', is_correct: false },
          { text: 'Rahmat', is_correct: false },
          { text: 'Kechirasiz', is_correct: false }
        ]
      },
      {
        question_text: '"감사합니다" (Kamsahamnida) qanday tarjima qilinadi?',
        points: 10,
        explanation: '"감사합니다" koreys tilida "Katta rahmat" ma\'nosida ishlatiladi.',
        options: [
          { text: 'Rahmat', is_correct: true },
          { text: 'Salom', is_correct: false },
          { text: 'Xush kelibsiz', is_correct: false },
          { text: 'Mayli', is_correct: false }
        ]
      },
      {
        question_text: 'Koreys yozuvi va alifbosi nima deb ataladi?',
        points: 10,
        explanation: 'Koreys milliy alifbosi Hangul (한글) deb ataladi.',
        options: [
          { text: 'Hangul (한글)', is_correct: true },
          { text: 'Hiragana', is_correct: false },
          { text: 'Iyeroglif', is_correct: false },
          { text: 'Pinyin', is_correct: false }
        ]
      },
      {
        question_text: '"네" (Ne) so\'zi nima degani?',
        points: 10,
        explanation: '"네" (Ne) koreys tilida "Ha" (rozilik) ma\'nosida keladi.',
        options: [
          { text: 'Ha (Rozilik)', is_correct: true },
          { text: 'Yo\'q', is_correct: false },
          { text: 'Bilmayman', is_correct: false },
          { text: 'Rahmat', is_correct: false }
        ]
      }
    ];
  }

  // 4. ARAB TILI (Arabic)
  if (lang.includes('arab') || lang.includes('arabic')) {
    return [
      {
        question_text: '"مرحبا" (Marhaban) so\'zining ma\'nosi nima?',
        points: 10,
        explanation: '"مرحبا" arab tilida "Salom" yoki "Xush kelibsiz" degani.',
        options: [
          { text: 'Salom / Xush kelibsiz', is_correct: true },
          { text: 'Xayr', is_correct: false },
          { text: 'Rahmat', is_correct: false },
          { text: 'Yo\'q', is_correct: false }
        ]
      },
      {
        question_text: '"شكرا" (Shukran) qanday ma\'no beradi?',
        points: 10,
        explanation: '"شكرا" arab tilida "Rahmat" degan ma\'noni anglatadi.',
        options: [
          { text: 'Rahmat', is_correct: true },
          { text: 'Kechirasiz', is_correct: false },
          { text: 'Salom', is_correct: false },
          { text: 'Iltimos', is_correct: false }
        ]
      },
      {
        question_text: 'Arab tilida yozuv qaysi tomondan yoziladi?',
        points: 10,
        explanation: 'Arab tili o\'ngdan chapga qarab o\'qiladi va yoziladi.',
        options: [
          { text: 'O\'ngdan chapga', is_correct: true },
          { text: 'Chapdan o\'ngga', is_correct: false },
          { text: 'Tepadan pastga', is_correct: false },
          { text: 'Farqi yo\'q', is_correct: false }
        ]
      }
    ];
  }

  // 5. TURK TILI (Turkish)
  if (lang.includes('turk') || lang.includes('turkish')) {
    return [
      {
        question_text: '"Merhaba" so\'zining o\'zbekcha ma\'nosi qaysi?',
        points: 10,
        explanation: '"Merhaba" turk tilida "Salom" degani.',
        options: [
          { text: 'Salom', is_correct: true },
          { text: 'Xayr', is_correct: false },
          { text: 'Rahmat', is_correct: false },
          { text: 'Iltimos', is_correct: false }
        ]
      },
      {
        question_text: '"Teşekkür ederim" nima degani?',
        points: 10,
        explanation: '"Teşekkür ederim" turk tilida "Rahmat aytaman" degani.',
        options: [
          { text: 'Tashakkur qilaman / Rahmat', is_correct: true },
          { text: 'Kechirasiz', is_correct: false },
          { text: 'Salom', is_correct: false },
          { text: 'Xush ko\'rdik', is_correct: false }
        ]
      },
      {
        question_text: '"Günaydın" iborasi qanday tarjima qilinadi?',
        points: 10,
        explanation: '"Günaydın" — "Xayrli tong" degani.',
        options: [
          { text: 'Xayrli tong', is_correct: true },
          { text: 'Xayrli kech', is_correct: false },
          { text: 'Xayrli tun', is_correct: false },
          { text: 'Ko\'rishguncha', is_correct: false }
        ]
      }
    ];
  }

  // 6. NEMIS TILI (German)
  if (lang.includes('nemis') || lang.includes('german')) {
    return [
      {
        question_text: '"Hallo" so\'zi nemis tilida nima degani?',
        points: 10,
        explanation: '"Hallo" nemis tilida "Salom" degani.',
        options: [
          { text: 'Salom', is_correct: true },
          { text: 'Xayr', is_correct: false },
          { text: 'Rahmat', is_correct: false },
          { text: 'Iltimos', is_correct: false }
        ]
      },
      {
        question_text: '"Danke" so\'zining ma\'nosi nima?',
        points: 10,
        explanation: '"Danke" nemis tilida "Rahmat" deganidir.',
        options: [
          { text: 'Rahmat', is_correct: true },
          { text: 'Kechirasiz', is_correct: false },
          { text: 'Iltimos', is_correct: false },
          { text: 'Salom', is_correct: false }
        ]
      },
      {
        question_text: '"Guten Morgen" qanday tarjima qilinadi?',
        points: 10,
        explanation: '"Guten Morgen" — "Xayrli tong" degani.',
        options: [
          { text: 'Xayrli tong', is_correct: true },
          { text: 'Xayrli kech', is_correct: false },
          { text: 'Xayrli kun', is_correct: false },
          { text: 'Xayr', is_correct: false }
        ]
      }
    ];
  }

  // Universal Fallback for any other language
  return [
    {
      question_text: `Ushbu 1-dars bo'yicha asosiy salomlashish so'zi qaysi?`,
      points: 10,
      explanation: 'Darsdagi birinchi va eng muhim ibora salomlashish hisoblanadi.',
      options: [
        { text: 'Darsdagi salomlashish iborasi', is_correct: true },
        { text: 'Xayrlashuv iborasi', is_correct: false },
        { text: 'Rahmat iborasi', is_correct: false },
        { text: 'Kechirim so\'rash', is_correct: false }
      ]
    },
    {
      question_text: `Ushbu tilda o'zingizni tanishtirish qanday boshlanadi?`,
      points: 10,
      explanation: 'O\'zini tanishtirishda "Mening ismim..." iborasidan foydalaniladi.',
      options: [
        { text: 'Ismni aytish iborasi bilan', is_correct: true },
        { text: 'Yoshi aytish bilan', is_correct: false },
        { text: 'Yashash joyi bilan', is_correct: false },
        { text: 'Kasbini aytish bilan', is_correct: false }
      ]
    }
  ];
};
