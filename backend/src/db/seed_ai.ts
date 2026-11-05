import { executeRun } from './index';

export async function seedAICourse() {
  console.log("Seeding IT & Sun'iy Intellekt Course...");

  // 1. Teacher
  await executeRun(
    `INSERT OR REPLACE INTO teachers (id, user_id, name, title, bio, avatar, languages, rating, total_students)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'tch-ai',
      'usr-admin-1',
      'Akmal Rustamov',
      'Senior AI & Machine Learning Muhandisi',
      "Google Developer Expert va sun'iy intellekt bo'yicha yetakchi dasturchi. Neyrotarmoqlar, Deep Learning va zamonaviy LLM modellarini yaratish bo'yicha 8+ yillik xalqaro tajribaga ega.",
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300',
      'Uzbek, English, Russian',
      4.99,
      38500
    ]
  );

  // 2. Course
  await executeRun(
    `INSERT OR REPLACE INTO courses (id, title, slug, language, description, cover_image, teacher_id, level, total_lessons, duration_hours, objectives, is_published, is_featured, enrollment_count, rating, price)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      'crs-it-ai',
      "IT va Sun'iy Intellekt (AI): Noldan Amaliy Dasturlash va Neyrotarmoqlar",
      'it-va-suniy-intellekt-noldan-amaliy-dasturlash',
      'IT & AI',
      "Zamonaviy IT va Sun'iy intellekt (AI) olamiga noldan qadam qo'ying! Python dasturlash, ChatGPT & Prompt Engineering, Machine Learning, Neyrotarmoqlar (Neural Networks) va sun'iy intellekt yordamida dasturlar yaratish amaliy kursi.",
      'https://images.unsplash.com/photo-1677442136019-21780ecad995?w=600',
      'tch-ai',
      'A1',
      4,
      14.5,
      JSON.stringify([
        "Sun'iy intellekt (AI), Machine Learning va Neyrotarmoqlarning ishlash tamoyillari",
        "Python dasturlash tilida AI modellari bilan ishlash asoslari",
        "ChatGPT, Claude va Gemini uchun professional Prompt Engineering sirlari",
        "O'z shaxsiy AI yordamchisi va aqlli chatbotlarini yaratish"
      ]),
      1,
      1,
      38500,
      4.99,
      0
    ]
  );

  // 3. Modules
  const modules = [
    {
      id: 'mod-ai-1',
      course_id: 'crs-it-ai',
      title: "1-Modul: Sun'iy Intellekt (AI) ga Kirish va Kelajak Texnologiyalari",
      order_index: 1
    },
    {
      id: 'mod-ai-2',
      course_id: 'crs-it-ai',
      title: "2-Modul: Prompt Engineering va Katta Til Modellari (ChatGPT, Gemini)",
      order_index: 2
    },
    {
      id: 'mod-ai-3',
      course_id: 'crs-it-ai',
      title: "3-Modul: Python va Neyrotarmoqlar Asoslari",
      order_index: 3
    }
  ];

  for (const m of modules) {
    await executeRun(
      `INSERT OR IGNORE INTO course_modules (id, course_id, title, order_index) VALUES (?, ?, ?, ?)`,
      [m.id, m.course_id, m.title, m.order_index]
    );
  }

  // 4. Lessons
  const lessons = [
    {
      id: 'lsn-1793882379935',
      module_id: 'mod-ai-1',
      course_id: 'crs-it-ai',
      title: '1-kun Codestart',
      order_index: 1,
      video_url: 'https://www.youtube.com/embed/QqBkN5TJEss',
      audio_url: '',
      duration_minutes: 20,
      content_text: "Sun'iy intellekt va dasturlashga amaliy kirish. Codestart loyihasi bo'yicha boshlang'ich tushunchalar va dars ko'rsatmalari.",
      vocabulary_json: JSON.stringify([
        { word: 'Artificial Intelligence (AI)', translation: "Sun'iy Intellekt", pronunciation: '/ˌɑː.tɪ.fɪʃ.əl ɪnˈtel.ɪ.dʒəns/', example: 'AI is changing the modern world.' },
        { word: 'Machine Learning (ML)', translation: "Mashinali O'rganish", pronunciation: '/məˈʃiːn ˈlɜː.nɪŋ/', example: 'Machine learning algorithms learn from data.' },
        { word: 'Deep Learning', translation: "Chuqur O'rganish (Neyrotarmoqlar)", pronunciation: '/diːp ˈlɜː.nɪŋ/', example: 'Deep learning mimics the human brain.' }
      ]),
      grammar_json: JSON.stringify([
        {
          rule: 'AI Tizimlarining 3 Asosiy Bosqichi',
          explanation: "1. Data (Ma'lumotlar) -> 2. Model Training (Modelni o'qitish) -> 3. Inference (Bashorat va xulosa chiqarish)",
          examples: ["ChatGPT katta hajmdagi matnlar ustida o'qitilgan.", "Rasm berilganda unda nima tasvirlanganini aniqlash."]
        }
      ]),
      transcript: "Ushbu darsda siz sun'iy intellekt qanday paydo bo'lgani, zamonaviy axborot texnologiyalaridagi o'rni va kelajakdagi imkoniyatlari haqida batafsil bilib olasiz.",
      materials_url: '/materials/ai-intro-lesson1.pdf'
    },
    {
      id: 'lsn-ai-1',
      module_id: 'mod-ai-1',
      course_id: 'crs-it-ai',
      title: "1-Dars: Sun'iy Intellekt Nima? AI, ML va Deep Learning Farqlari",
      order_index: 2,
      video_url: 'https://www.youtube.com/embed/2ePf9rue1Ao',
      audio_url: '',
      duration_minutes: 25,
      content_text: "Sun'iy intellekt (AI) tushunchasi, uning turlari (Narrow AI, General AI) hamda mashinali o'rganish (Machine Learning) bilan farqlari haqida to'liq tushuncha.",
      vocabulary_json: JSON.stringify([
        { word: 'Artificial Intelligence (AI)', translation: "Sun'iy Intellekt", pronunciation: '/ˌɑː.tɪ.fɪʃ.əl ɪnˈtel.ɪ.dʒəns/', example: 'AI is changing the modern world.' },
        { word: 'Machine Learning (ML)', translation: "Mashinali O'rganish", pronunciation: '/məˈʃiːn ˈlɜː.nɪŋ/', example: 'Machine learning algorithms learn from data.' },
        { word: 'Deep Learning', translation: "Chuqur O'rganish (Neyrotarmoqlar)", pronunciation: '/diːp ˈlɜː.nɪŋ/', example: 'Deep learning mimics the human brain.' },
        { word: 'Algorithm', translation: "Algoritm / Ko'rsatmalar ketma-ketligi", pronunciation: '/ˈæl.ɡə.rɪ.ðəm/', example: 'The algorithm analyzes user behavior.' }
      ]),
      grammar_json: JSON.stringify([
        {
          rule: 'AI Tizimlarining 3 Asosiy Bosqichi',
          explanation: "1. Data (Ma'lumotlar) -> 2. Model Training (Modelni o'qitish) -> 3. Inference (Bashorat va xulosa chiqarish)",
          examples: ["ChatGPT katta hajmdagi matnlar ustida o'qitilgan.", "Rasm berilganda unda nima tasvirlanganini aniqlash."]
        }
      ]),
      transcript: "Ushbu darsda siz sun'iy intellekt qanday paydo bo'lgani, zamonaviy axborot texnologiyalaridagi o'rni va kelajakdagi imkoniyatlari haqida batafsil bilib olasiz.",
      materials_url: '/materials/ai-intro-lesson1.pdf'
    },
    {
      id: 'lsn-ai-2',
      module_id: 'mod-ai-2',
      course_id: 'crs-it-ai',
      title: "2-Dars: ChatGPT, Gemini va Prompt Engineering Sirlari",
      order_index: 2,
      video_url: 'https://www.youtube.com/embed/jC4v5AS4RIM',
      audio_url: '',
      duration_minutes: 30,
      content_text: "Katta til modellari bilan ishlash, to'g'ri kontekst berish, rol o'ynatish (Role prompting) va professional promptlar tuzish.",
      vocabulary_json: JSON.stringify([
        { word: 'Prompt', translation: "Ko'rsatma / Buyruq", pronunciation: '/prɒmpt/', example: 'Write a clear prompt for the AI.' },
        { word: 'LLM (Large Language Model)', translation: 'Katta Til Modeli', pronunciation: '/el el em/', example: 'GPT-4 is a powerful LLM.' },
        { word: 'Hallucination', translation: "AI to'qib chiqarishi (Gallyutsinatsiya)", pronunciation: '/həˌluː.sɪˈneɪ.ʃən/', example: 'Always verify AI answers to avoid hallucination.' }
      ]),
      grammar_json: JSON.stringify([
        {
          rule: 'Mukammal Prompt Strukturasi (C-T-C)',
          explanation: 'Context (Vaziyat) + Task (Vazifa) + Constraints (Cheklovlar va format)',
          examples: ["Sen tajribali dasturchisan. Menga Python-da bot kodi yozib ber. Javobing qisqa va izohli bo'lsin."]
        }
      ]),
      transcript: "Prompt Engineering bu sun'iy intellekt bilan eng yuqori samaradorlikda muloqot qilish san'atidir.",
      materials_url: '/materials/prompt-engineering.pdf'
    },
    {
      id: 'lsn-ai-3',
      module_id: 'mod-ai-3',
      course_id: 'crs-it-ai',
      title: "3-Dars: Neyron To'rlari (Neural Networks) Qanday Fikrlaydi?",
      order_index: 3,
      video_url: 'https://www.youtube.com/embed/aircAruvnKk',
      audio_url: '',
      duration_minutes: 35,
      content_text: "Inson miyasi neyronlari va sun'iy neyronlar. Weights (vaznlar), bias va faollashtirish funksiyalari (Activation functions).",
      vocabulary_json: JSON.stringify([
        { word: 'Neural Network', translation: "Neyron To'ri", pronunciation: '/ˈnjʊə.rəl ˈnet.wɜːk/', example: 'Neural networks recognize handwritten digits.' },
        { word: 'Weights & Bias', translation: 'Vaznlar va siljish', pronunciation: '/weɪts ænd ˈbaɪ.əs/', example: 'The network adjusts its weights during training.' }
      ]),
      grammar_json: JSON.stringify([
        {
          rule: 'Neyrotarmoq qatlamlari (Layers)',
          explanation: 'Input Layer (Kirish) -> Hidden Layers (Yashirin qatlamlar) -> Output Layer (Chiqish)',
          examples: ['Kirish: Rasm piksellari, Chiqish: Mushuk yoki It degan javob.']
        }
      ]),
      transcript: "Neyrotarmoqlar inson miyasi biologik neyronlari asosida loyihalashtirilgan bo'lib, murakkab naqshlarni o'rganadi.",
      materials_url: '/materials/neural-networks.pdf'
    },
    {
      id: 'lsn-ai-4',
      module_id: 'mod-ai-3',
      course_id: 'crs-it-ai',
      title: '4-Dars: Python Yordamida Birinchi AI Loyihangizni Yaratish',
      order_index: 4,
      video_url: 'https://www.youtube.com/embed/7eh4d6sabA0',
      audio_url: '',
      duration_minutes: 40,
      content_text: "Python dasturlash tili orqali tayyor AI kutubxonalari bilan ishlash, matnni tahlil qilish va bashorat qilish modelini ishga tushirish.",
      vocabulary_json: JSON.stringify([
        { word: 'Dataset', translation: "Ma'lumotlar to'plami", pronunciation: '/ˈdeɪ.tə.set/', example: 'Train the model on a large dataset.' },
        { word: 'Accuracy', translation: 'Aniqlik darajasi', pronunciation: '/ˈæk.jə.rə.si/', example: 'The model reached 98% accuracy.' }
      ]),
      grammar_json: JSON.stringify([
        {
          rule: 'Modelni Baholash (Evaluation)',
          explanation: "Training Data bilan o'qitish, Test Data bilan aniqlikni tekshirish.",
          examples: ["80% ma'lumot o'qitish uchun, 20% tekshirish uchun ajratiladi."]
        }
      ]),
      transcript: "Python sun'iy intellekt muhandislarining eng asosiy quroli hisoblanadi.",
      materials_url: '/materials/python-ai.pdf'
    }
  ];

  for (const l of lessons) {
    await executeRun(
      `INSERT OR IGNORE INTO lessons (id, module_id, course_id, title, order_index, video_url, audio_url, duration_minutes, content_text, vocabulary_json, grammar_json, transcript, materials_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [l.id, l.module_id, l.course_id, l.title, l.order_index, l.video_url, l.audio_url, l.duration_minutes, l.content_text, l.vocabulary_json, l.grammar_json, l.transcript, l.materials_url]
    );
  }

  // 5. Quiz for Lesson 1
  const quiz = {
    id: 'qz-ai-1',
    lesson_id: 'lsn-ai-1',
    course_id: 'crs-it-ai',
    title: "1-Dars: Sun'iy Intellekt Asoslari Mustahkamlash Testi",
    description: "Sun'iy intellekt, neyrotarmoqlar va LLM modellari bo'yicha bilimlaringizni sinovdan o'tkazing!",
    passing_score: 75,
    time_limit_minutes: 10
  };

  await executeRun(
    `INSERT OR IGNORE INTO quizzes (id, lesson_id, course_id, title, description, passing_score, time_limit_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [quiz.id, quiz.lesson_id, quiz.course_id, quiz.title, quiz.description, quiz.passing_score, quiz.time_limit_minutes]
  );

  const questions = [
    {
      id: 'qq-ai-1',
      quiz_id: 'qz-ai-1',
      question_type: 'multiple_choice',
      question_text: "Sun'iy intellekt (AI - Artificial Intelligence) atamasi nimani anglatadi?",
      points: 10,
      explanation: "Sun'iy intellekt — inson aql-idroki va fikrlash jarayonlarini modellashtiruvchi kompyuter tizimidir.",
      order_index: 1,
      options: [
        { id: 'opt-ai-1-1', text: "Inson aql-idroki va fikrlash jarayonlarini modellashtiruvchi kompyuter tizimi", is_correct: 1 },
        { id: 'opt-ai-1-2', text: "Faqatgina oddiy kalkulyator dasturi", is_correct: 0 },
        { id: 'opt-ai-1-3', text: "Kompyuterning fizik monitor ekrani", is_correct: 0 },
        { id: 'opt-ai-1-4', text: "Internet kabellari tarmog'i", is_correct: 0 }
      ]
    },
    {
      id: 'qq-ai-2',
      quiz_id: 'qz-ai-1',
      question_type: 'multiple_choice',
      question_text: "ChatGPT, Gemini va Claude kabi tizimlar qaysi texnologiyaga asoslangan?",
      points: 10,
      explanation: "Ushbu tizimlar Katta Til Modellari (LLM) va Generativ AI tizimlariga asoslangan.",
      order_index: 2,
      options: [
        { id: 'opt-ai-2-1', text: "Katta Til Modellari (LLM) va Generativ Sun'iy Intellekt", is_correct: 1 },
        { id: 'opt-ai-2-2', text: "Faqat Word va Excel jadvallari", is_correct: 0 },
        { id: 'opt-ai-2-3', text: "Oddiy magnitofon va ovoz yozgich", is_correct: 0 },
        { id: 'opt-ai-2-4', text: "Windows fayl boshqaruvchisi", is_correct: 0 }
      ]
    },
    {
      id: 'qq-ai-3',
      quiz_id: 'qz-ai-1',
      question_type: 'multiple_choice',
      question_text: "Sun'iy intellekt va Machine Learning sohasida dunyoda 1-o'rinda ishlatiladigan dasturlash tili qaysi?",
      points: 10,
      explanation: "Python o'zining boy sun'iy intellekt kutubxonalari (PyTorch, TensorFlow) tufayli 1-o'rinda turadi.",
      order_index: 3,
      options: [
        { id: 'opt-ai-3-1', text: "Python", is_correct: 1 },
        { id: 'opt-ai-3-2', text: "HTML", is_correct: 0 },
        { id: 'opt-ai-3-3', text: "CSS", is_correct: 0 },
        { id: 'opt-ai-3-4', text: "Photoshop", is_correct: 0 }
      ]
    },
    {
      id: 'qq-ai-4',
      quiz_id: 'qz-ai-1',
      question_type: 'multiple_choice',
      question_text: "Prompt Engineering nima?",
      points: 10,
      explanation: "Prompt Engineering — bu sun'iy intellekt modelidan eng aniq va sifatli natija olish uchun to'g'ri ko'rsatma berish usulidir.",
      order_index: 4,
      options: [
        { id: 'opt-ai-4-1', text: "Sun'iy intellektga eng sifatli natija olish uchun to'g'ri ko'rsatma berish mahorati", is_correct: 1 },
        { id: 'opt-ai-4-2', text: "Kompyuterni elektr tokiga ulash", is_correct: 0 },
        { id: 'opt-ai-4-3', text: "Dastur kodlarini butunlay o'chirib tashlash", is_correct: 0 },
        { id: 'opt-ai-4-4', text: "Printerdan qog'oz chiqarish", is_correct: 0 }
      ]
    }
  ];

  for (const q of questions) {
    await executeRun(
      `INSERT OR IGNORE INTO quiz_questions (id, quiz_id, question_type, question_text, points, explanation, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [q.id, q.quiz_id, q.question_type, q.question_text, q.points, q.explanation, q.order_index]
    );

    for (let j = 0; j < q.options.length; j++) {
      const opt = q.options[j];
      await executeRun(
        `INSERT OR IGNORE INTO quiz_options (id, question_id, option_text, is_correct, order_index)
         VALUES (?, ?, ?, ?, ?)`,
        [opt.id, q.id, opt.text, opt.is_correct, j + 1]
      );
    }
  }

  console.log("IT & Sun'iy Intellekt Course seeded successfully!");
}
