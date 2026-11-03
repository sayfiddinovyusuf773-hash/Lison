export type LanguageCode = 'uz' | 'en' | 'ru';

export interface User {
  id: string;
  email: string;
  first_name: string;
  last_name: string;
  avatar?: string | null;
  role: 'student' | 'teacher' | 'admin' | 'super_admin';
  preferred_language: string;
  learning_level: string;
  xp_points: number;
  level: number;
  daily_goal_minutes: number;
  streak?: number;
  longest_streak?: number;
  created_at?: string;
}

export interface Teacher {
  id: string;
  user_id?: string;
  name: string;
  title: string;
  bio: string;
  avatar: string;
  languages: string;
  rating: number;
  total_students: number;
  courses_count?: number;
  courses?: Course[];
}

export interface Course {
  id: string;
  title: string;
  slug: string;
  language: string;
  description: string;
  cover_image: string;
  teacher_id?: string;
  teacher_name?: string;
  teacher_avatar?: string;
  teacher_title?: string;
  teacher_bio?: string;
  level: 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
  total_lessons: number;
  duration_hours: number;
  objectives: string[];
  is_published: number;
  is_featured: number;
  is_paid?: number;
  price?: number;
  currency?: string;
  enrollment_count: number;
  rating: number;
  is_enrolled?: boolean;
  progress_percent?: number;
  is_completed?: boolean;
  is_wishlist?: boolean;
  last_accessed_lesson_id?: string | null;
  pending_request?: {
    id: string;
    status: 'pending' | 'approved' | 'rejected';
    payment_method: string;
    phone: string;
    created_at: string;
  } | null;
  curriculum?: CourseModule[];
  created_at?: string;
}

export interface EnrollmentRequest {
  id: string;
  user_id: string;
  course_id: string;
  course_title?: string;
  course_cover?: string;
  user_name: string;
  user_email: string;
  user_avatar?: string;
  phone: string;
  payment_method: string;
  amount: number;
  currency: string;
  status: 'pending' | 'approved' | 'rejected';
  admin_note?: string;
  created_at: string;
  reviewed_at?: string;
  reviewed_by?: string;
}

export interface CourseModule {
  id: string;
  course_id: string;
  title: string;
  description?: string;
  order_index: number;
  lessons: LessonSummary[];
}

export interface LessonSummary {
  id: string;
  module_id: string;
  course_id: string;
  title: string;
  order_index: number;
  duration_minutes: number;
  video_url?: string;
  is_completed?: boolean;
}

export interface VocabularyItem {
  word: string;
  translation: string;
  pronunciation: string;
  example: string;
}

export interface GrammarRule {
  rule: string;
  explanation: string;
  examples: string[];
}

export interface Lesson {
  id: string;
  module_id: string;
  course_id: string;
  course_title?: string;
  course_slug?: string;
  title: string;
  order_index: number;
  video_url?: string;
  audio_url?: string;
  duration_minutes: number;
  content_text?: string;
  vocabulary: VocabularyItem[];
  grammar: GrammarRule[];
  transcript?: string;
  materials_url?: string;
  prev_lesson?: { id: string; title: string } | null;
  next_lesson?: { id: string; title: string } | null;
  quiz?: { id: string; title: string; passing_score: number; time_limit_minutes: number } | null;
  progress: {
    is_completed: number;
    playback_time_seconds: number;
    is_bookmarked: number;
    student_notes: string;
  };
}

export interface QuizOption {
  id: string;
  text: string;
  match_pair?: string;
}

export interface QuizQuestion {
  id: string;
  quiz_id: string;
  question_type: 'multiple_choice' | 'true_false' | 'fill_blank' | 'word_matching' | 'sentence_order' | 'translation' | 'listening' | 'reading';
  question_text: string;
  audio_url?: string;
  reading_passage?: string;
  points: number;
  order_index: number;
  options: QuizOption[];
}

export interface Quiz {
  id: string;
  lesson_id?: string;
  course_id: string;
  course_title?: string;
  title: string;
  description?: string;
  passing_score: number;
  time_limit_minutes: number;
  questions: QuizQuestion[];
}

export interface Achievement {
  id: string;
  code: string;
  title_uz: string;
  title_en: string;
  title_ru: string;
  description_uz: string;
  description_en: string;
  description_ru: string;
  icon: string;
  xp_reward: number;
  is_unlocked?: boolean;
  unlocked_at?: string | null;
}

export interface Certificate {
  id: string;
  user_id: string;
  course_id: string;
  student_name: string;
  course_title: string;
  issue_date: string;
  verification_url: string;
  is_revoked: number;
  revocation_reason?: string | null;
  issued_by: string;
  cover_image?: string;
  level?: string;
}

export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'achievement' | 'course' | 'quiz' | 'certificate' | 'reminder' | 'system';
  link_url?: string;
  is_read: number;
  created_at: string;
}

export interface SpeakingTopic {
  id: string;
  title_uz: string;
  title_en: string;
  title_ru: string;
  language: string;
  level: string;
  prompt: string;
  sample_sentence: string;
}

export interface SpeakingResult {
  session_id: string;
  user_transcript: string;
  pronunciation_score: number;
  grammar_score: number;
  vocabulary_score: number;
  overall_score: number;
  feedback: string;
  improved_sentence: string;
  xp_earned: number;
}
