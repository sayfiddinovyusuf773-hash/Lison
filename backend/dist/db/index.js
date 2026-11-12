"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initDatabase = exports.executeRun = exports.queryOne = exports.queryAll = exports.db = void 0;
const sqlite3_1 = __importDefault(require("sqlite3"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const dbPath = process.env.DATABASE_PATH || path_1.default.resolve(__dirname, '../../ziyo_academy.db');
const dbDir = path_1.default.dirname(dbPath);
if (!fs_1.default.existsSync(dbDir)) {
    fs_1.default.mkdirSync(dbDir, { recursive: true });
}
exports.db = new sqlite3_1.default.Database(dbPath, (err) => {
    if (err) {
        console.error('Failed to connect to SQLite database:', err.message);
    }
    else {
        console.log('Connected to SQLite database at:', dbPath);
    }
});
// Enable foreign keys and WAL mode for high concurrency
exports.db.serialize(() => {
    exports.db.run('PRAGMA foreign_keys = ON;');
    exports.db.run('PRAGMA journal_mode = WAL;');
});
// Promisified query wrappers
const queryAll = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.all(sql, params, (err, rows) => {
            if (err)
                reject(err);
            else
                resolve(rows);
        });
    });
};
exports.queryAll = queryAll;
const queryOne = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.get(sql, params, (err, row) => {
            if (err)
                reject(err);
            else
                resolve(row);
        });
    });
};
exports.queryOne = queryOne;
const executeRun = (sql, params = []) => {
    return new Promise((resolve, reject) => {
        exports.db.run(sql, params, function (err) {
            if (err)
                reject(err);
            else
                resolve({ lastID: this.lastID, changes: this.changes });
        });
    });
};
exports.executeRun = executeRun;
// Database Schema Initialization
const initDatabase = async () => {
    console.log('Initializing database schema with foreign key constraints & indexes...');
    const schemaSQL = `
    -- 1. Users
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      password_plain TEXT, -- For admin reference dashboard
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      avatar TEXT,
      preferred_language TEXT DEFAULT 'uz',
      learning_level TEXT DEFAULT 'A1',
      daily_goal_minutes INTEGER DEFAULT 20,
      xp_points INTEGER DEFAULT 0,
      coins INTEGER DEFAULT 0,
      level INTEGER DEFAULT 1,
      is_active INTEGER DEFAULT 1,
      is_suspended INTEGER DEFAULT 0,
      email_verified INTEGER DEFAULT 1,
      role TEXT DEFAULT 'student',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME
    );

    CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
    CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

    -- 2. Roles & User Roles (RBAC)
    CREATE TABLE IF NOT EXISTS roles (
      id TEXT PRIMARY KEY,
      name TEXT UNIQUE NOT NULL,
      description TEXT
    );

    CREATE TABLE IF NOT EXISTS user_roles (
      user_id TEXT NOT NULL,
      role_id TEXT NOT NULL,
      assigned_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      PRIMARY KEY (user_id, role_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE
    );

    -- 3. Teachers
    CREATE TABLE IF NOT EXISTS teachers (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      name TEXT NOT NULL,
      title TEXT NOT NULL,
      bio TEXT NOT NULL,
      avatar TEXT,
      languages TEXT NOT NULL, -- comma separated, e.g. "English, Uzbek"
      rating REAL DEFAULT 5.0,
      total_students INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL
    );

    -- 4. Courses
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      slug TEXT UNIQUE NOT NULL,
      language TEXT NOT NULL, -- e.g. "English", "Russian", "Arabic", "Uzbek", "German"
      description TEXT NOT NULL,
      cover_image TEXT NOT NULL,
      teacher_id TEXT,
      level TEXT NOT NULL, -- "A1", "A2", "B1", "B2", "C1", "C2"
      total_lessons INTEGER DEFAULT 0,
      duration_hours REAL DEFAULT 0,
      objectives TEXT, -- JSON string array
      is_published INTEGER DEFAULT 1,
      is_featured INTEGER DEFAULT 0,
      is_paid INTEGER DEFAULT 0, -- 0 = bepul, 1 = pullik
      price INTEGER DEFAULT 0, -- in UZS (e.g. 250000)
      currency TEXT DEFAULT 'UZS',
      price_coins INTEGER DEFAULT 100, -- Coin narxi (tangalar evaziga ochish)
      enrollment_count INTEGER DEFAULT 0,
      rating REAL DEFAULT 5.0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      deleted_at DATETIME,
      FOREIGN KEY (teacher_id) REFERENCES teachers(id) ON DELETE SET NULL
    );

    CREATE INDEX IF NOT EXISTS idx_courses_lang ON courses(language);
    CREATE INDEX IF NOT EXISTS idx_courses_level ON courses(level);

    -- 5. Course Modules
    CREATE TABLE IF NOT EXISTS course_modules (
      id TEXT PRIMARY KEY,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      order_index INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 6. Lessons
    CREATE TABLE IF NOT EXISTS lessons (
      id TEXT PRIMARY KEY,
      module_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      order_index INTEGER DEFAULT 0,
      video_url TEXT,
      audio_url TEXT,
      duration_minutes INTEGER DEFAULT 15,
      content_text TEXT,
      vocabulary_json TEXT, -- JSON array of {word, translation, pronunciation, example}
      grammar_json TEXT,    -- JSON array of {rule, explanation, examples}
      transcript TEXT,
      materials_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (module_id) REFERENCES course_modules(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_lessons_course ON lessons(course_id);

    -- 7. Enrollments
    CREATE TABLE IF NOT EXISTS enrollments (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      progress_percent INTEGER DEFAULT 0,
      is_completed INTEGER DEFAULT 0,
      enrolled_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      completed_at DATETIME,
      last_accessed_lesson_id TEXT,
      is_wishlist INTEGER DEFAULT 0,
      UNIQUE (user_id, course_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 8. Lesson Progress & Notes & Bookmarks
    CREATE TABLE IF NOT EXISTS lesson_progress (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      lesson_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      is_completed INTEGER DEFAULT 0,
      playback_time_seconds INTEGER DEFAULT 0,
      completed_at DATETIME,
      is_bookmarked INTEGER DEFAULT 0,
      student_notes TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, lesson_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 9. Quizzes
    CREATE TABLE IF NOT EXISTS quizzes (
      id TEXT PRIMARY KEY,
      lesson_id TEXT,
      course_id TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      passing_score INTEGER DEFAULT 70, -- in percentage
      time_limit_minutes INTEGER DEFAULT 15,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (lesson_id) REFERENCES lessons(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    -- 10. Quiz Questions
    CREATE TABLE IF NOT EXISTS quiz_questions (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      question_type TEXT NOT NULL, -- "multiple_choice", "true_false", "fill_blank", "word_matching", "sentence_order", "translation", "listening", "reading"
      question_text TEXT NOT NULL,
      audio_url TEXT,
      reading_passage TEXT,
      points INTEGER DEFAULT 10,
      explanation TEXT,
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE
    );

    -- 11. Quiz Options & Answers
    CREATE TABLE IF NOT EXISTS quiz_options (
      id TEXT PRIMARY KEY,
      question_id TEXT NOT NULL,
      option_text TEXT NOT NULL,
      is_correct INTEGER DEFAULT 0,
      match_pair TEXT, -- for word matching pairs
      order_index INTEGER DEFAULT 0,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
    );

    -- 12. Quiz Attempts & Server-Side Scoring
    CREATE TABLE IF NOT EXISTS quiz_attempts (
      id TEXT PRIMARY KEY,
      quiz_id TEXT NOT NULL,
      user_id TEXT NOT NULL,
      score_percent INTEGER NOT NULL,
      total_points INTEGER NOT NULL,
      earned_points INTEGER NOT NULL,
      passed INTEGER NOT NULL,
      time_spent_seconds INTEGER DEFAULT 0,
      attempted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (quiz_id) REFERENCES quizzes(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 13. Quiz Answers (Detailed Audit)
    CREATE TABLE IF NOT EXISTS quiz_answers (
      id TEXT PRIMARY KEY,
      attempt_id TEXT NOT NULL,
      question_id TEXT NOT NULL,
      user_answer TEXT,
      is_correct INTEGER NOT NULL,
      earned_points INTEGER NOT NULL,
      FOREIGN KEY (attempt_id) REFERENCES quiz_attempts(id) ON DELETE CASCADE,
      FOREIGN KEY (question_id) REFERENCES quiz_questions(id) ON DELETE CASCADE
    );

    -- 14. Certificates
    CREATE TABLE IF NOT EXISTS certificates (
      id TEXT PRIMARY KEY, -- Unique Verification Code (e.g., "ZIYO-2026-EN8492")
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      student_name TEXT NOT NULL,
      course_title TEXT NOT NULL,
      issue_date DATETIME DEFAULT CURRENT_TIMESTAMP,
      verification_url TEXT NOT NULL,
      is_revoked INTEGER DEFAULT 0,
      revocation_reason TEXT,
      issued_by TEXT DEFAULT 'Ziyo Academy & Ta''lim Markazi',
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_cert_code ON certificates(id);

    -- 15. Achievements & Gamification
    CREATE TABLE IF NOT EXISTS achievements (
      id TEXT PRIMARY KEY,
      code TEXT UNIQUE NOT NULL, -- "FIRST_LESSON", "STREAK_7", "QUIZ_CHAMP", "VOCAB_MASTER", "COURSE_COMPLETED"
      title_uz TEXT NOT NULL,
      title_en TEXT NOT NULL,
      title_ru TEXT NOT NULL,
      description_uz TEXT NOT NULL,
      description_en TEXT NOT NULL,
      description_ru TEXT NOT NULL,
      icon TEXT NOT NULL,
      xp_reward INTEGER DEFAULT 50
    );

    CREATE TABLE IF NOT EXISTS user_achievements (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      achievement_id TEXT NOT NULL,
      unlocked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      UNIQUE (user_id, achievement_id),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (achievement_id) REFERENCES achievements(id) ON DELETE CASCADE
    );

    -- 16. Learning Streaks
    CREATE TABLE IF NOT EXISTS learning_streaks (
      user_id TEXT PRIMARY KEY,
      current_streak INTEGER DEFAULT 1,
      longest_streak INTEGER DEFAULT 1,
      last_activity_date DATE DEFAULT (DATE('now')),
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 17. AI Conversations & Messages
    CREATE TABLE IF NOT EXISTS ai_conversations (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      target_language TEXT NOT NULL,
      topic TEXT DEFAULT 'General Practice',
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS ai_messages (
      id TEXT PRIMARY KEY,
      conversation_id TEXT NOT NULL,
      role TEXT NOT NULL, -- "user" | "assistant" | "system"
      content TEXT NOT NULL,
      audio_url TEXT,
      corrections_json TEXT, -- suggestions, corrected sentence
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (conversation_id) REFERENCES ai_conversations(id) ON DELETE CASCADE
    );

    -- 18. Speaking Practice Sessions
    CREATE TABLE IF NOT EXISTS speaking_sessions (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      topic TEXT NOT NULL,
      target_language TEXT NOT NULL,
      user_transcript TEXT NOT NULL,
      pronunciation_score INTEGER,
      grammar_score INTEGER,
      vocabulary_score INTEGER,
      overall_score INTEGER,
      feedback TEXT,
      improved_sentence TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 19. In-App Notifications
    CREATE TABLE IF NOT EXISTS notifications (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      title TEXT NOT NULL,
      message TEXT NOT NULL,
      type TEXT NOT NULL, -- "achievement", "course", "quiz", "certificate", "reminder", "system"
      link_url TEXT,
      is_read INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );

    -- 20. Audit Logs (Security & Admin)
    CREATE TABLE IF NOT EXISTS audit_logs (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      action TEXT NOT NULL,
      resource TEXT NOT NULL,
      details TEXT,
      ip_address TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 21. System Settings
    CREATE TABLE IF NOT EXISTS system_settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      description TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    -- 22. Enrollment Requests (To'lov va a'zo bo'lish so'rovlari)
    CREATE TABLE IF NOT EXISTS enrollment_requests (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      course_id TEXT NOT NULL,
      user_name TEXT NOT NULL,
      user_email TEXT NOT NULL,
      phone TEXT NOT NULL,
      payment_method TEXT DEFAULT 'Click', -- 'Click', 'Payme', 'Uzum', 'Karta'
      amount INTEGER DEFAULT 0,
      currency TEXT DEFAULT 'UZS',
      status TEXT DEFAULT 'pending', -- 'pending', 'approved', 'rejected'
      admin_note TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      reviewed_at DATETIME,
      reviewed_by TEXT,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
      FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_enr_req_status ON enrollment_requests(status);
    CREATE INDEX IF NOT EXISTS idx_enr_req_user ON enrollment_requests(user_id);
    CREATE INDEX IF NOT EXISTS idx_enr_req_course ON enrollment_requests(course_id);

    -- 23. Email Verification Codes
    CREATE TABLE IF NOT EXISTS email_verification_codes (
      id TEXT PRIMARY KEY,
      user_id TEXT,
      email TEXT NOT NULL,
      code_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_evc_email ON email_verification_codes(email);

    -- 24. Password Reset Tokens
    CREATE TABLE IF NOT EXISTS password_reset_tokens (
      id TEXT PRIMARY KEY,
      user_id TEXT NOT NULL,
      email TEXT NOT NULL,
      token_hash TEXT NOT NULL,
      expires_at DATETIME NOT NULL,
      attempts INTEGER DEFAULT 0,
      used INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
    CREATE INDEX IF NOT EXISTS idx_prt_email ON password_reset_tokens(email);
  `;
    return new Promise((resolve, reject) => {
        exports.db.exec(schemaSQL, async (err) => {
            if (err) {
                console.error('Error executing schema SQL:', err);
                reject(err);
            }
            else {
                // Safe schema migration for existing sqlite database: add is_paid, price, currency, price_coins, coins
                try {
                    await (0, exports.executeRun)(`ALTER TABLE courses ADD COLUMN is_paid INTEGER DEFAULT 0;`).catch(() => { });
                    await (0, exports.executeRun)(`ALTER TABLE courses ADD COLUMN price INTEGER DEFAULT 0;`).catch(() => { });
                    await (0, exports.executeRun)(`ALTER TABLE courses ADD COLUMN currency TEXT DEFAULT 'UZS';`).catch(() => { });
                    await (0, exports.executeRun)(`ALTER TABLE courses ADD COLUMN price_coins INTEGER DEFAULT 100;`).catch(() => { });
                    await (0, exports.executeRun)(`ALTER TABLE users ADD COLUMN coins INTEGER DEFAULT 0;`).catch(() => { });
                    await (0, exports.executeRun)(`UPDATE users SET coins = 0 WHERE coins IS NULL;`).catch(() => { });
                    await (0, exports.executeRun)(`UPDATE courses SET price_coins = 100 WHERE price_coins IS NULL;`).catch(() => { });
                }
                catch { }
                // Auto-seed sample courses and demo accounts if database is empty (e.g. initial Render deploy)
                try {
                    const userCount = await (0, exports.queryOne)(`SELECT COUNT(*) as count FROM users`);
                    if (!userCount || userCount.count === 0) {
                        console.log('Database is empty. Running initial educational seed...');
                        const { runSeed } = await import('./seed.js');
                        await runSeed(true);
                    }
                }
                catch (seedErr) {
                    console.warn('Auto-seed check notice:', seedErr);
                }
                console.log('Database tables & indexes successfully created.');
                resolve();
            }
        });
    });
};
exports.initDatabase = initDatabase;
