"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.runSeed = void 0;
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const index_1 = require("./index");
let isSeeding = false;
const runSeed = async (skipInit = false) => {
    if (isSeeding)
        return;
    isSeeding = true;
    try {
        if (!skipInit) {
            await (0, index_1.initDatabase)();
        }
        console.log('Seeding initial educational data...');
        const passwordHash = await bcryptjs_1.default.hash('admin123', 10);
        const teacherPassHash = await bcryptjs_1.default.hash('teacher123', 10);
        const studentPassHash = await bcryptjs_1.default.hash('student123', 10);
        // 1. Roles
        const roles = [
            { id: 'role-superadmin', name: 'super_admin', description: 'Bosh boshqaruvchi (Full Control)' },
            { id: 'role-admin', name: 'admin', description: 'Platforma administratori' },
            { id: 'role-teacher', name: 'teacher', description: 'Ustoz va kurs muallifi' },
            { id: 'role-student', name: 'student', description: `Talaba / o'rganuvchi` },
        ];
        for (const r of roles) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO roles (id, name, description) VALUES (?, ?, ?)`, [r.id, r.name, r.description]);
        }
        // 2. Users
        const users = [
            {
                id: 'usr-admin-1',
                email: 'admin@ziyo.uz',
                password_hash: passwordHash,
                first_name: 'Jahongir',
                last_name: 'Pulatov',
                avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
                preferred_language: 'uz',
                learning_level: 'C2',
                xp_points: 3500,
                level: 12,
                role: 'super_admin'
            },
            {
                id: 'usr-teacher-1',
                email: 'anvar.teacher@ziyo.uz',
                password_hash: teacherPassHash,
                first_name: 'Anvar',
                last_name: 'Toshpulatov',
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
                preferred_language: 'uz',
                learning_level: 'C2',
                xp_points: 2100,
                level: 8,
                role: 'teacher'
            },
            {
                id: 'usr-teacher-2',
                email: 'dilnoza.teacher@ziyo.uz',
                password_hash: teacherPassHash,
                first_name: 'Dilnoza',
                last_name: 'Rahimova',
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150',
                preferred_language: 'uz',
                learning_level: 'C1',
                xp_points: 1950,
                level: 7,
                role: 'teacher'
            },
            {
                id: 'usr-teacher-3',
                email: 'farrukh.teacher@ziyo.uz',
                password_hash: teacherPassHash,
                first_name: 'Farrukh',
                last_name: 'Mirzayev',
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
                preferred_language: 'uz',
                learning_level: 'C2',
                xp_points: 1800,
                level: 6,
                role: 'teacher'
            },
            {
                id: 'usr-student-1',
                email: 'student@ziyo.uz',
                password_hash: studentPassHash,
                first_name: 'Sardor',
                last_name: 'Alimov',
                avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
                preferred_language: 'uz',
                learning_level: 'A2',
                xp_points: 620,
                level: 3,
                role: 'student'
            }
        ];
        for (const u of users) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO users (id, email, password_hash, first_name, last_name, avatar, preferred_language, learning_level, xp_points, level, role)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [u.id, u.email, u.password_hash, u.first_name, u.last_name, u.avatar, u.preferred_language, u.learning_level, u.xp_points, u.level, u.role]);
        }
        // 3. Teachers Directory
        const teachers = [
            {
                id: 'tch-1',
                user_id: 'usr-teacher-1',
                name: 'Anvar Toshpulatov',
                title: "IELTS 8.5 & Nemis tili (C1) Katta O'qituvchisi",
                bio: "Oksford va Berlin universitetlari bitiruvchisi. 10 yildan ortiq vaqt davomida 15,000 dan ortiq o'zbek yoshlariga xalqaro tillarni oson metodikada o'rgatib kelmoqda.",
                avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300',
                languages: 'English, German, Uzbek',
                rating: 4.95,
                total_students: 18400
            },
            {
                id: 'tch-2',
                user_id: 'usr-teacher-2',
                name: 'Dilnoza Rahimova',
                title: 'Koreys (TOPIK 6) va Yapon (N1) Tili Mutaxassisi',
                bio: "Seul Milliy Universiteti magistranti. Zamonaviy interaktiv yondashuv va media darslar orqali Sharq tillarini noldan erkin muloqot darajasigacha yetkazadi.",
                avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300',
                languages: 'Korean, Japanese, Uzbek, Russian',
                rating: 4.98,
                total_students: 14200
            },
            {
                id: 'tch-3',
                user_id: 'usr-teacher-3',
                name: 'Farrukh Mirzayev',
                title: 'Rus va Arab Tili Filologi, Lingvist',
                bio: "Qohira Al-Azhar universiteti va Moskva Davlat Lingvistika Universiteti bitiruvchisi. Arab sarf-nahvi hamda rus tili jonli so'zlashuv sirlarini sodda tushuntiradi.",
                avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=300',
                languages: 'Russian, Arabic, Uzbek',
                rating: 4.92,
                total_students: 11900
            }
        ];
        for (const t of teachers) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO teachers (id, user_id, name, title, bio, avatar, languages, rating, total_students)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [t.id, t.user_id, t.name, t.title, t.bio, t.avatar, t.languages, t.rating, t.total_students]);
        }
        // 4. Courses
        const courses = [
            {
                id: 'crs-eng-a1',
                title: "Ingliz Tili: Noldan A1 Boshlang'ich Kurs",
                slug: 'ingliz-tili-a1-boshlangich',
                language: 'English',
                description: "Ingliz tilini noldan mukammal o'rganing: alfavit, fonetika, asosiy kundalik iboralar, oddiy zamonlar va erkin salomlashuv qoidalari.",
                cover_image: 'https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=600',
                teacher_id: 'tch-1',
                level: 'A1',
                total_lessons: 12,
                duration_hours: 18.5,
                objectives: JSON.stringify([
                    "Ingliz tilida to'g'ri talaffuz va o'qish qoidalarini o'rganish",
                    "Kundalik 500 dan ortiq eng muhim so'zlarni yodlash",
                    "O'zini tanishtirish, soatni so'rash va do'konda muloqot qilish",
                    "Present Simple va To Be fe'llarini xatosiz qo'llash"
                ]),
                is_published: 1,
                is_featured: 1,
                enrollment_count: 24500,
                rating: 4.96
            },
            {
                id: 'crs-eng-b1',
                title: 'Ingliz Tili: Intermediate va IELTS Asoslari (B1-B2)',
                slug: 'ingliz-tili-intermediate-b1-b2',
                language: 'English',
                description: "Erkin so'zlashuv, murakkab grammatik strukturalar, listening va speaking ko'nikmalarini oshirib, IELTS 6.5+ darajaga chiqish kursi.",
                cover_image: 'https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=600',
                teacher_id: 'tch-1',
                level: 'B1',
                total_lessons: 16,
                duration_hours: 24.0,
                objectives: JSON.stringify([
                    "Tez va ravon inglizcha nutq so'zlash ko'nikmasi",
                    "Murakkab zamonlar (Perfect Continuous, Conditionals)",
                    "Akademik insho (Essay) yozish va fikrni dalillash",
                    "IELTS Listening va Speaking bo'yicha amaliy mashqlar"
                ]),
                is_published: 1,
                is_featured: 1,
                enrollment_count: 16700,
                rating: 4.94
            },
            {
                id: 'crs-kor-a1',
                title: "Koreys Tili: Hangul va Jonli So'zlashuv (TOPIK 1)",
                slug: 'koreys-tili-hangul-topik-1',
                language: 'Korean',
                description: "Koreys alfaviti Hangulni bir kunda o'rganing! Doramalar, K-pop va Janubiy Koreyada o'qish/ishlash uchun zarur boshlang'ich baza.",
                cover_image: 'https://images.unsplash.com/photo-1517154421773-0529f29ea451?w=600',
                teacher_id: 'tch-2',
                level: 'A1',
                total_lessons: 10,
                duration_hours: 15.0,
                objectives: JSON.stringify([
                    "Hangul harflarini to'g'ri yozish va o'qish",
                    "Hurmat shakllari (Ayo/Oyo, Imnida/Gamnida)",
                    "Raqamlar, hisoblagichlar va kundalik xarid iboralari",
                    "TOPIK I darajasidagi dastlabki testlarni topshirish"
                ]),
                is_published: 1,
                is_featured: 1,
                enrollment_count: 19800,
                rating: 4.97
            },
            {
                id: 'crs-rus-a1',
                title: "Rus Tili: Boshlang'ich Grammatika va So'zlashuv",
                slug: 'rus-tili-sozlashuv-va-grammatika',
                language: 'Russian',
                description: "Rus tilida uyalmasdan va qo'rqmasdan gapiring! Asosiy rodlar, kelishiklar (padejlar) va kundalik jonli muloqot mashg'ulotlari.",
                cover_image: 'https://images.unsplash.com/photo-1513326738677-b964603b136d?w=600',
                teacher_id: 'tch-3',
                level: 'A1',
                total_lessons: 12,
                duration_hours: 16.5,
                objectives: JSON.stringify([
                    "Rus tilidagi rod va ko'plik shakllarini tushunish",
                    "Asosiy 6 ta padej (kelishik) funksiyasini anglash",
                    "Ishxonada, transportda va ko'chada erkin muloqot",
                    "1000 ta eng faol ruscha so'zni esda qoladigan metodda o'zlashtirish"
                ]),
                is_published: 1,
                is_featured: 1,
                enrollment_count: 22100,
                rating: 4.91
            },
            {
                id: 'crs-ara-a1',
                title: "Arab Tili: Husnixat va Sarf-Nahv Boshlang'ich",
                slug: 'arab-tili-sarf-nahv',
                language: 'Arabic',
                description: "Arab alifbosi, harflarning ulanishi, to'g'ri mahrajlar, qiroat asoslari va Qur'oni Karim tilini tushunishga ilk qadamlar.",
                cover_image: 'https://images.unsplash.com/photo-1542816417-0983c9c9ad53?w=600',
                teacher_id: 'tch-3',
                level: 'A1',
                total_lessons: 10,
                duration_hours: 14.0,
                objectives: JSON.stringify([
                    "28 ta arab harfining mahraj va sifatlarini to'g'ri talaffuz qilish",
                    "Harflarning boshda, o'rtada va oxirda yozilishini o'zlashtirish",
                    "Oddiy ismiy va fe'liy jumlalarni tuzish",
                    "Lug'at yordamida arabcha matnlarni o'qiy olish"
                ]),
                is_published: 1,
                is_featured: 0,
                enrollment_count: 14300,
                rating: 4.95
            },
            {
                id: 'crs-deu-a1',
                title: "Nemis Tili: A1 Boshlang'ich (Start Deutsch 1)",
                slug: 'nemis-tili-a1-start-deutsch',
                language: 'German',
                description: "Germaniyada o'qish (Ausbildung, Universitet) va ishlashni xohlovchilar uchun Goethe Zertifikat A1 ga mo'ljallangan to'liq kurs.",
                cover_image: 'https://images.unsplash.com/photo-1467269204594-9661b134dd2b?w=600',
                teacher_id: 'tch-1',
                level: 'A1',
                total_lessons: 12,
                duration_hours: 17.0,
                objectives: JSON.stringify([
                    "Artikllar (der, die, das) va ularning kelishiklari",
                    "Fe'llarning hozirgi zamonda tuslanishi",
                    "Germaniyadagi kundalik hayot va do'kon muloqotlari",
                    "Goethe A1 imtihoni savollariga to'g'ri javob berish"
                ]),
                is_published: 1,
                is_featured: 0,
                enrollment_count: 11200,
                rating: 4.93
            },
            {
                id: 'crs-uzb-a1',
                title: 'Learn Uzbek Language: From Zero to Fluent (A1-A2)',
                slug: 'learn-uzbek-from-zero',
                language: 'Uzbek',
                description: 'Comprehensive Uzbek language course for international students, travelers, and expats. Master greetings, grammar, and rich Uzbek culture.',
                cover_image: 'https://images.unsplash.com/photo-1528728329032-2972f65dfb3f?w=600',
                teacher_id: 'tch-1',
                level: 'A1',
                total_lessons: 8,
                duration_hours: 12.0,
                objectives: JSON.stringify([
                    "Learn the Uzbek Latin alphabet and accurate pronunciation",
                    "Essential daily greetings and hospitality expressions",
                    "Agglutinative suffixes: plurals, possession, cases",
                    "Travel comfortably in Samarkand, Bukhara, and Tashkent"
                ]),
                is_published: 1,
                is_featured: 1,
                enrollment_count: 6800,
                rating: 4.98
            },
            {
                id: 'crs-tur-a1',
                title: "Turk Tili: Jonli So'zlashuv va Istanbul Shevasi (A1-A2)",
                slug: 'turk-tili-istanbul-shevasi',
                language: 'Turkish',
                description: "O'zbek tiliga eng yaqin qardosh til! Turkiya seriallari, sayohat va biznes muloqoti uchun mo'ljallangan interaktiv kurs.",
                cover_image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600',
                teacher_id: 'tch-2',
                level: 'A1',
                total_lessons: 10,
                duration_hours: 13.5,
                objectives: JSON.stringify([
                    "Unlilar uyg'unligi qoidasi (Ünlü uyumu)",
                    "Hozirgi zamon (-iyor) va o'tgan zamon (-di) qo'shimchalari",
                    "Istanbulda sayohat, bozor va mehmonxona muloqotlari",
                    "Turkcha seriallarni subtitrsiz tushunish bazasi"
                ]),
                is_published: 1,
                is_featured: 0,
                enrollment_count: 13900,
                rating: 4.92
            }
        ];
        for (const c of courses) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO courses (id, title, slug, language, description, cover_image, teacher_id, level, total_lessons, duration_hours, objectives, is_published, is_featured, enrollment_count, rating)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [c.id, c.title, c.slug, c.language, c.description, c.cover_image, c.teacher_id, c.level, c.total_lessons, c.duration_hours, c.objectives, c.is_published, c.is_featured, c.enrollment_count, c.rating]);
        }
        // 5. Modules
        const modules = [
            {
                id: 'mod-eng-1',
                course_id: 'crs-eng-a1',
                title: '1-Modul: Alifbo, Fonetika va Salomlashuv',
                description: "Ingliz tili asoslari, harflar, to'g'ri talaffuz va kundalik rasmiy/norasmiy salomlashish.",
                order_index: 1
            },
            {
                id: 'mod-eng-2',
                course_id: 'crs-eng-a1',
                title: "2-Modul: To Be Fe'li va O'zini Tanishtirish",
                description: "Am, is, are yordamchi fe'llari, mamlakatlar, kasblar va oila a'zolari haqida gapirish.",
                order_index: 2
            },
            {
                id: 'mod-eng-3',
                course_id: 'crs-eng-a1',
                title: '3-Modul: Present Simple va Kun Tartibi',
                description: "Do/Does yordamchi fe'llari, vaqtni aytish, odatlar va har kungi mashg'ulotlar.",
                order_index: 3
            }
        ];
        for (const m of modules) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO course_modules (id, course_id, title, description, order_index)
       VALUES (?, ?, ?, ?, ?)`, [m.id, m.course_id, m.title, m.description, m.order_index]);
        }
        // 6. Lessons
        const lessons = [
            {
                id: 'lsn-eng-1',
                module_id: 'mod-eng-1',
                course_id: 'crs-eng-a1',
                title: '1-Dars: Ingliz Alifbosi va Tovushlar Sirlari',
                order_index: 1,
                video_url: 'https://www.youtube.com/embed/HQK9n8x8o0E',
                audio_url: 'https://actions.google.com/sounds/v1/human_voices/applause.ogg',
                duration_minutes: 15,
                content_text: `Assalomu alaykum va xush kelibsiz! Ushbu darsda biz ingliz tilidagi 26 ta harf va ularning talaffuz qoidalarini ko'rib chiqamiz. Ingliz tilida harflar soni 26 ta bo'lsa-da, tovushlar soni 44 tani tashkil etadi. Shuning uchun talaffuzga alohida e'tibor berish muhim!`,
                vocabulary_json: JSON.stringify([
                    { word: 'Hello', translation: 'Salom (rasmiy)', pronunciation: '/həˈləʊ/', example: 'Hello, my name is Sardor.' },
                    { word: 'Good morning', translation: 'Xayrli tong', pronunciation: '/ɡʊd ˈmɔː.nɪŋ/', example: 'Good morning, teacher!' },
                    { word: 'Welcome', translation: 'Xush kelibsiz', pronunciation: '/ˈwel.kəm/', example: 'Welcome to Ziyo Academy.' },
                    { word: 'Alphabet', translation: 'Alifbo', pronunciation: '/ˈæl.fə.bet/', example: 'The English alphabet has 26 letters.' },
                    { word: 'Pronunciation', translation: 'Talaffuz', pronunciation: '/prəˌnʌn.siˈeɪ.ʃən/', example: 'Good pronunciation is very important.' }
                ]),
                grammar_json: JSON.stringify([
                    {
                        rule: 'Unli va Undosh harflar (Vowels & Consonants)',
                        explanation: "Ingliz tilida 5 ta unli harf mavjud: A, E, I, O, U (va ba'zan Y). Qolgan 21 ta harf undosh hisoblanadi.",
                        examples: ['A apple', 'E elephant', 'I internet', 'O orange', 'U umbrella']
                    },
                    {
                        rule: 'A va An noaniq artikllari',
                        explanation: "Undosh tovush bilan boshlangan so'zlar oldidan 'a', unli tovush bilan boshlangan so'zlar oldidan 'an' qo'yiladi.",
                        examples: ['a book', 'a student', 'an apple', 'an orange', "an hour (/aʊər/ - h o'qilmaydi)"]
                    }
                ]),
                transcript: `Hello everyone! Welcome to our first lesson at Ziyo Academy. Today we are starting our exciting journey to master the English language from the very beginning. Let's look at the letters A, B, C, D...`,
                materials_url: '/materials/english-a1-lesson1.pdf'
            },
            {
                id: 'lsn-eng-2',
                module_id: 'mod-eng-1',
                course_id: 'crs-eng-a1',
                title: '2-Dars: Salomlashish va Xayrlashish Iboralari',
                order_index: 2,
                video_url: 'https://www.youtube.com/embed/Fw0rdhmsrqo',
                audio_url: 'https://actions.google.com/sounds/v1/human_voices/applause.ogg',
                duration_minutes: 18,
                content_text: `Bugungi darsimizda ingliz tilida rasmiy (formal) va norasmiy (informal) salomlashish hamda xayrlashish qoidalarini amalda mashq qilamiz. Do'stlar bilan "Hi / What's up?", ustoz va hamkasblar bilan "Good afternoon / Nice to meet you" iboralari ishlatiladi.`,
                vocabulary_json: JSON.stringify([
                    { word: 'Nice to meet you', translation: 'Tanishganimdan xursandman', pronunciation: '/naɪs tuː miːt juː/', example: 'Nice to meet you, Anvar.' },
                    { word: 'How are you?', translation: 'Qalaysiz? Ahvolingiz qanday?', pronunciation: '/haʊ ɑːr juː/', example: 'How are you today?' },
                    { word: 'I am fine', translation: 'Men yaxshiman', pronunciation: '/aɪ æm faɪn/', example: 'I am fine, thank you.' },
                    { word: 'Goodbye', translation: 'Xayr', pronunciation: '/ɡʊdˈbaɪ/', example: 'Goodbye, see you tomorrow!' },
                    { word: 'Have a nice day', translation: "Kuningiz xayrli o'tsin", pronunciation: '/hæv ə naɪs deɪ/', example: 'Have a nice day, my friend.' }
                ]),
                grammar_json: JSON.stringify([
                    {
                        rule: 'Rasmiy va Norasmiy salomlashuv farqi',
                        explanation: "Rasmiy: Good morning, Good afternoon, Good evening, How do you do? Norasmiy: Hi, Hey, How are you doing?, What's new?",
                        examples: ['Rasmiy: Good morning, Mr. Smith.', "Norasmiy: Hey Sardor, what's up?"]
                    }
                ]),
                transcript: `Welcome back to Lesson 2! In this session, we will practice everyday greetings and farewells in English. Listen carefully to the tone and pronunciation.`,
                materials_url: '/materials/english-a1-lesson2.pdf'
            },
            {
                id: 'lsn-eng-3',
                module_id: 'mod-eng-2',
                course_id: 'crs-eng-a1',
                title: "3-Dars: To Be Fe'li (Am / Is / Are) va Shaxs O'lchovlari",
                order_index: 3,
                video_url: 'https://www.youtube.com/embed/HQK9n8x8o0E',
                audio_url: 'https://actions.google.com/sounds/v1/human_voices/applause.ogg',
                duration_minutes: 20,
                content_text: `Ingliz tilining asosi bo'lgan 'To Be' fe'li hozirgi zamonda 'am', 'is', 'are' shakllariga ega. O'zbek tilidagi "-man", "-san", "-dir", "-miz", "-siz" qo'shimchalarining ekvivalenti hisoblanadi.`,
                vocabulary_json: JSON.stringify([
                    { word: 'Student', translation: "Talaba / o'quvchi", pronunciation: '/ˈstjuː.dənt/', example: 'I am a diligent student.' },
                    { word: 'Teacher', translation: "Ustoz / o'qituvchi", pronunciation: '/ˈtiː.tʃər/', example: 'She is an English teacher.' },
                    { word: 'Country', translation: 'Mamlakat / yurt', pronunciation: '/ˈkʌn.tri/', example: 'Uzbekistan is my country.' },
                    { word: 'From', translation: '-dan / -dan kelgan', pronunciation: '/frɒm/', example: 'I am from Tashkent.' }
                ]),
                grammar_json: JSON.stringify([
                    {
                        rule: 'To Be Tuslanishi (Subject + To Be)',
                        explanation: 'I -> am | He, She, It -> is | You, We, They -> are',
                        examples: ['I am a student.', 'He is from Uzbekistan.', 'They are doctors.']
                    },
                    {
                        rule: "Inkor va So'roq shakli",
                        explanation: "Inkor: To Be + not. So'roq: To Be gapning boshiga chiqadi.",
                        examples: ['I am not tired.', 'Is he your brother?', "Yes, he is. / No, he isn't."]
                    }
                ]),
                transcript: `In this lesson, we master the cornerstone of English grammar: the verb 'to be'. I am, you are, he is, she is, it is, we are, they are.`,
                materials_url: '/materials/english-a1-lesson3.pdf'
            }
        ];
        for (const l of lessons) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO lessons (id, module_id, course_id, title, order_index, video_url, audio_url, duration_minutes, content_text, vocabulary_json, grammar_json, transcript, materials_url)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [l.id, l.module_id, l.course_id, l.title, l.order_index, l.video_url, l.audio_url, l.duration_minutes, l.content_text, l.vocabulary_json, l.grammar_json, l.transcript, l.materials_url]);
        }
        // 7. Interactive Quizzes with ALL 8 Question Types
        const quiz = {
            id: 'qz-eng-1',
            lesson_id: 'lsn-eng-1',
            course_id: 'crs-eng-a1',
            title: "1-Dars bo'yicha Mustahkamlash Testi",
            description: "Ingliz alifbosi, salomlashuv va artikllar bo'yicha bilimlaringizni sinab ko'ring. 8 xil interaktiv savol turi!",
            passing_score: 75,
            time_limit_minutes: 10
        };
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO quizzes (id, lesson_id, course_id, title, description, passing_score, time_limit_minutes)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [quiz.id, quiz.lesson_id, quiz.course_id, quiz.title, quiz.description, quiz.passing_score, quiz.time_limit_minutes]);
        const questions = [
            {
                id: 'q-1',
                quiz_id: 'qz-eng-1',
                question_type: 'multiple_choice',
                question_text: 'Ingliz alifbosida nechta harf mavjud?',
                points: 10,
                explanation: 'Ingliz alifbosida jami 26 ta harf bor (5 ta unli, 21 ta undosh).',
                order_index: 1,
                options: [
                    { id: 'opt-1-1', text: '24 ta', is_correct: 0 },
                    { id: 'opt-1-2', text: '26 ta', is_correct: 1 },
                    { id: 'opt-1-3', text: '28 ta', is_correct: 0 },
                    { id: 'opt-1-4', text: '32 ta', is_correct: 0 }
                ]
            },
            {
                id: 'q-2',
                quiz_id: 'qz-eng-1',
                question_type: 'true_false',
                question_text: `To'g'rimi yoki Noto'g'rimi: "An apple" birikmasida "an" artikli to'g'ri ishlatilgan.`,
                points: 10,
                explanation: `"Apple" so'zi unli tovush bilan boshlanganligi sababli "an" artikli to'g'ri qo'llangan.`,
                order_index: 2,
                options: [
                    { id: 'opt-2-1', text: "To'g'ri (True)", is_correct: 1 },
                    { id: 'opt-2-2', text: "Noto'g'ri (False)", is_correct: 0 }
                ]
            },
            {
                id: 'q-3',
                quiz_id: 'qz-eng-1',
                question_type: 'fill_blank',
                question_text: `Jumlani to'ldiring: "Nice to ___ you, Sardor!"`,
                points: 10,
                explanation: `Tanishuv paytida "Nice to meet you" (Tanishganimdan xursandman) iborasi ishlatiladi.`,
                order_index: 3,
                options: [
                    { id: 'opt-3-1', text: 'meet', is_correct: 1 },
                    { id: 'opt-3-2', text: 'see', is_correct: 0 },
                    { id: 'opt-3-3', text: 'look', is_correct: 0 }
                ]
            },
            {
                id: 'q-4',
                quiz_id: 'qz-eng-1',
                question_type: 'word_matching',
                question_text: "So'zlarni ularning o'zbekcha ma'nolari bilan juftlang:",
                points: 15,
                explanation: 'Hello = Salom, Welcome = Xush kelibsiz, Student = Talaba, Alphabet = Alifbo.',
                order_index: 4,
                options: [
                    { id: 'opt-4-1', text: 'Hello', match_pair: 'Salom', is_correct: 1 },
                    { id: 'opt-4-2', text: 'Welcome', match_pair: 'Xush kelibsiz', is_correct: 1 },
                    { id: 'opt-4-3', text: 'Student', match_pair: 'Talaba', is_correct: 1 },
                    { id: 'opt-4-4', text: 'Alphabet', match_pair: 'Alifbo', is_correct: 1 }
                ]
            },
            {
                id: 'q-5',
                quiz_id: 'qz-eng-1',
                question_type: 'sentence_order',
                question_text: "So'zlarni to'g'ri tartibda joylashtiring: [is, my, This, friend]",
                points: 15,
                explanation: "Ingliz tilida ega birinchi, so'ng kesim keladi: 'This is my friend'.",
                order_index: 5,
                options: [
                    { id: 'opt-5-1', text: 'This is my friend', is_correct: 1 },
                    { id: 'opt-5-2', text: 'This friend is my', is_correct: 0 },
                    { id: 'opt-5-3', text: 'My is this friend', is_correct: 0 }
                ]
            },
            {
                id: 'q-6',
                quiz_id: 'qz-eng-1',
                question_type: 'translation',
                question_text: '"Xayrli tong" iborasi ingliz tilida qanday bo\'ladi?',
                points: 10,
                explanation: '"Good morning" xayrli tong ma\'nosini bildiradi.',
                order_index: 6,
                options: [
                    { id: 'opt-6-1', text: 'Good morning', is_correct: 1 },
                    { id: 'opt-6-2', text: 'Good evening', is_correct: 0 },
                    { id: 'opt-6-3', text: 'Good night', is_correct: 0 }
                ]
            },
            {
                id: 'q-7',
                quiz_id: 'qz-eng-1',
                question_type: 'listening',
                question_text: "Ovozli yozuvni tinglang: Spiker qaysi so'zni talaffuz qilmoqda?",
                audio_url: 'https://actions.google.com/sounds/v1/human_voices/applause.ogg',
                points: 15,
                explanation: 'Spiker tabassum bilan "Welcome" so\'zini aytadi.',
                order_index: 7,
                options: [
                    { id: 'opt-7-1', text: 'Welcome', is_correct: 1 },
                    { id: 'opt-7-2', text: 'Window', is_correct: 0 },
                    { id: 'opt-7-3', text: 'Water', is_correct: 0 }
                ]
            },
            {
                id: 'q-8',
                quiz_id: 'qz-eng-1',
                question_type: 'reading',
                question_text: "Matnni o'qing va savolga javob bering: Sardor qayerdan?",
                reading_passage: 'Hello! My name is Sardor. I am 20 years old and I am a student. I am from Tashkent, Uzbekistan. I like learning languages at Ziyo Academy.',
                points: 15,
                explanation: 'Matnda aniq aytilgan: "I am from Tashkent, Uzbekistan".',
                order_index: 8,
                options: [
                    { id: 'opt-8-1', text: 'Toshkentdan', is_correct: 1 },
                    { id: 'opt-8-2', text: 'Samarqanddan', is_correct: 0 },
                    { id: 'opt-8-3', text: 'London shahridan', is_correct: 0 }
                ]
            }
        ];
        for (const q of questions) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO quiz_questions (id, quiz_id, question_type, question_text, audio_url, reading_passage, points, explanation, order_index)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`, [q.id, q.quiz_id, q.question_type, q.question_text, q.audio_url || null, q.reading_passage || null, q.points, q.explanation, q.order_index]);
            for (let i = 0; i < q.options.length; i++) {
                const opt = q.options[i];
                await (0, index_1.executeRun)(`INSERT OR REPLACE INTO quiz_options (id, question_id, option_text, is_correct, match_pair, order_index)
         VALUES (?, ?, ?, ?, ?, ?)`, [opt.id, q.id, opt.text, opt.is_correct, opt.match_pair || null, i + 1]);
            }
        }
        // 8. Achievements
        const achievements = [
            {
                id: 'ach-1',
                code: 'FIRST_LESSON',
                title_uz: 'Birinchi Qadam',
                title_en: 'First Step',
                title_ru: 'Первый шаг',
                description_uz: 'Platformada birinchi video darsni muvaffaqiyatli yakunladingiz!',
                description_en: 'Successfully completed your first video lesson!',
                description_ru: 'Успешно завершен первый видеоурок!',
                icon: 'Award',
                xp_reward: 50
            },
            {
                id: 'ach-2',
                code: 'STREAK_7',
                title_uz: '7 Kunlik Olov (Streak)',
                title_en: '7-Day Streak',
                title_ru: 'Семидневный огонь',
                description_uz: "Bir hafta davomida har kuni dars o'qib odat shakllantirdingiz.",
                description_en: 'Practiced daily for a whole week.',
                description_ru: 'Занимались каждый день целую неделю без пропусков.',
                icon: 'Flame',
                xp_reward: 150
            },
            {
                id: 'ach-3',
                code: 'QUIZ_CHAMP',
                title_uz: 'Test Chempioni',
                title_en: 'Quiz Champion',
                title_ru: 'Чемпион тестов',
                description_uz: 'Dars testini 90%+ natija bilan birinchi urinishda yechdingiz!',
                description_en: 'Passed a quiz with 90%+ score on your first attempt.',
                description_ru: 'Сдали тест с результатом 90%+ с первой попытки.',
                icon: 'Zap',
                xp_reward: 100
            },
            {
                id: 'ach-4',
                code: 'VOCAB_MASTER',
                title_uz: "Lug'at Boyligi",
                title_en: 'Vocabulary Master',
                title_ru: 'Мастер словарного запаса',
                description_uz: "100 dan ortiq yangi so'zlarni darslar orqali o'zlashtirdingiz.",
                description_en: 'Mastered over 100 new vocabulary words.',
                description_ru: 'Выучили более 100 новых иностранных слов.',
                icon: 'BookOpen',
                xp_reward: 100
            },
            {
                id: 'ach-5',
                code: 'SPEAKING_PRO',
                title_uz: "Jonli Nutq Notig'i",
                title_en: 'Speaking Pro',
                title_ru: 'Мастер речи',
                description_uz: "AI nutq studiyasida 5 ta so'zlashuv mavzusini muvaffaqiyatli himoya qildingiz.",
                description_en: 'Completed 5 speaking practice topics in the AI studio.',
                description_ru: 'Успешно выполнили 5 тем разговорной практики в ИИ-студии.',
                icon: 'Mic',
                xp_reward: 150
            },
            {
                id: 'ach-6',
                code: 'COURSE_COMPLETED',
                title_uz: 'Kurs Bitiruvchisi',
                title_en: 'Course Graduate',
                title_ru: 'Выпускник курса',
                description_uz: "Barcha modullarni tamomlab, rasmiy sertifikatga ega bo'ldingiz!",
                description_en: 'Completed all modules and earned a verified certificate!',
                description_ru: 'Завершили все модули и получили проверенный сертификат!',
                icon: 'GraduationCap',
                xp_reward: 500
            }
        ];
        for (const a of achievements) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO achievements (id, code, title_uz, title_en, title_ru, description_uz, description_en, description_ru, icon, xp_reward)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`, [a.id, a.code, a.title_uz, a.title_en, a.title_ru, a.description_uz, a.description_en, a.description_ru, a.icon, a.xp_reward]);
        }
        // 9. Student Enrollment & Progress for Sardor Alimov
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO enrollments (id, user_id, course_id, progress_percent, is_completed, last_accessed_lesson_id)
     VALUES (?, ?, ?, ?, ?, ?)`, ['enr-sardor-1', 'usr-student-1', 'crs-eng-a1', 33, 0, 'lsn-eng-2']);
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO enrollments (id, user_id, course_id, progress_percent, is_completed, last_accessed_lesson_id)
     VALUES (?, ?, ?, ?, ?, ?)`, ['enr-sardor-2', 'usr-student-1', 'crs-kor-a1', 15, 0, 'lsn-eng-1']);
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO lesson_progress (id, user_id, lesson_id, course_id, is_completed, playback_time_seconds, is_bookmarked, student_notes)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`, ['lp-1', 'usr-student-1', 'lsn-eng-1', 'crs-eng-a1', 1, 900, 1, "Harflar va unli tovushlar jadvalini qayta takrorlash kerak. A va An qoidasi zo'r tushuntirilgan."]);
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO learning_streaks (user_id, current_streak, longest_streak, last_activity_date)
     VALUES (?, ?, ?, DATE('now'))`, ['usr-student-1', 5, 12]);
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO user_achievements (id, user_id, achievement_id)
     VALUES (?, ?, ?)`, ['ua-1', 'usr-student-1', 'ach-1']);
        // 10. Sample Verified Certificate
        const certId = 'ZIYO-2026-EN8492';
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO certificates (id, user_id, course_id, student_name, course_title, verification_url, issued_by)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            certId,
            'usr-student-1',
            'crs-eng-a1',
            'Sardor Alimov',
            "Ingliz Tili: Noldan A1 Boshlang'ich Kurs",
            `https://ziyoacademy.uz/verify/${certId}`,
            "Ziyo Academy & Oliy Ta'lim Innovatsiyalari Markazi"
        ]);
        // 11. Initial Notifications
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO notifications (id, user_id, title, message, type, link_url, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            'notif-1',
            'usr-student-1',
            'Xush kelibsiz!',
            "Ziyo Academy platformasiga xush kelibsiz! O'zingiz qiziqqan tilni tanlang va erkin o'rganing.",
            'system',
            '/courses',
            0
        ]);
        await (0, index_1.executeRun)(`INSERT OR REPLACE INTO notifications (id, user_id, title, message, type, link_url, is_read)
     VALUES (?, ?, ?, ?, ?, ?, ?)`, [
            'notif-2',
            'usr-student-1',
            'Yutuq ochildi: Birinchi Qadam',
            "Birinchi darsni muvaffaqiyatli tamomlaganingiz uchun +50 XP hisobingizga qo'shildi!",
            'achievement',
            '/dashboard',
            0
        ]);
        // 12. System Settings
        const settings = [
            { key: 'platform_name', value: 'Ziyo Academy', description: 'Platforma rasmiy nomi' },
            { key: 'default_language', value: 'uz', description: 'Birlamchi interfeys tili' },
            { key: 'supported_languages', value: 'uz,en,ru', description: "Qo'llab-quvvatlanadigan tillar" },
            { key: 'ai_daily_limit_per_user', value: '50', description: "Har bir talaba uchun kunlik AI so'rovlar limiti" },
            { key: 'ai_model', value: 'gemini-2.5-flash', description: 'Asosiy AI tili modeli' },
            { key: 'maintenance_mode', value: '0', description: 'Texnik tanaffus holati (0 = Faol, 1 = Tanaffus)' },
            { key: 'certificate_prefix', value: 'ZIYO-2026', description: 'Sertifikat unikal kodi prefiksi' }
        ];
        for (const s of settings) {
            await (0, index_1.executeRun)(`INSERT OR REPLACE INTO system_settings (key, value, description)
       VALUES (?, ?, ?)`, [s.key, s.value, s.description]);
        }
        console.log('Seeding completed successfully!');
    }
    finally {
        isSeeding = false;
    }
};
exports.runSeed = runSeed;
if (require.main === module || process.argv[1]?.endsWith('seed.ts')) {
    (0, exports.runSeed)()
        .then(() => {
        console.log('Seed execution finished.');
        process.exit(0);
    })
        .catch((err) => {
        console.error('Seed execution error:', err);
        process.exit(1);
    });
}
