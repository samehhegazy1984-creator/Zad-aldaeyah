export type AIContentType =
  | 'مقال إسلامي'
  | 'خطبة جمعة'
  | 'خطبة عيد'
  | 'موعظة'
  | 'درس'
  | 'محاضرة'
  | 'كلمة قصيرة'
  | 'درس للأطفال'
  | 'مادة تربوية'
  | 'مادة أسرية'
  | 'منشور دعوي'
  | 'سيناريو فيديو'
  | 'برنامج إيماني'
  | 'ورقة بحثية'
  | 'مذكرة دراسية';

export type AIAudience =
  | 'عامة المسلمين'
  | 'الشباب'
  | 'الأطفال'
  | 'الآباء والأمهات'
  | 'المعلمون'
  | 'المعلمون والمربون'
  | 'الدعاة'
  | 'طلاب العلم'
  | 'الباحثون'
  | 'عموم القراء';

export type AILength =
  | 'شاملة' // 3500-5000 كلمة
  | 'بحثية' // 5000-8000+ كلمة
  | 'متعمقة' // 2500-3500 كلمة
  | 'معيارية' // 1500-2200 كلمة
  | 'موجزة' // 800-1200 كلمة
  | 'مطولة' // للتوافق
  | 'متوسطة' // للتوافق
  | 'مختصرة' // للتوافق
  | 'قصيرة'
  | '10 دقائق'
  | '20 دقيقة'
  | '30 دقيقة'
  | '45 دقيقة'
  | 'ساعة'
  | 'مقال متوسط'
  | 'مقال طويل';

export type AITashkeel = 'تشكيل كامل' | 'تشكيل جزئي' | 'بدون تشكيل';

export type AIDetailLevel = 'شامل' | 'متعمق' | 'بحثي' | 'معياري' | 'متوسط' | 'مختصر';

export type AIStyle =
  | 'عربي واضح'
  | 'عربي جزيل'
  | 'تربوي'
  | 'دعوي'
  | 'إيماني'
  | 'فكري تحليلي'
  | 'مؤثر'
  | 'قصصي'
  | 'أكاديمي'
  | 'مبسط'
  | 'حواري';

export type AIEvidenceLevel =
  | 'توثيق موسع'
  | 'توثيق قوي'
  | 'توثيق أساسي'
  | 'موثق'
  | 'متوسط'
  | 'مختصر';

export interface AIGenerationParams {
  contentType: AIContentType;
  audience: AIAudience;
  topic: string;
  length: AILength;
  style: AIStyle;
  evidenceLevel: AIEvidenceLevel;
  tashkeel?: AITashkeel;
  detailLevel?: AIDetailLevel;
  includeReferences?: boolean;
  additionalInstructions?: string;
}

export interface AyahQuote {
  text: string;
  surah: string;
  number?: number;
  explanation?: string;
}

export interface HadithQuote {
  text: string;
  narrator?: string;
  source?: string;
  grade?: string;
  explanation?: string;
}

export interface SalafQuote {
  scholar: string;
  statement: string;
  source?: string;
  era?: string;
}

export interface PropheticEvent {
  incident: string;
  lesson: string;
  context?: string;
}

export interface Misconception {
  claim: string;
  correction: string;
  evidence?: string;
}

export interface ArticleQualityScore {
  overall: number; // e.g. 9.4
  depth: number;
  completeness: number;
  quranEvidence: number;
  hadithEvidence: number;
  salafEvidence: number;
  structure: number;
  arabicQuality: number;
  tashkeelAccuracy: number;
  practicalUsefulness: number;
  summaryNotes?: string;
}

export interface ContentSection {
  heading: string;
  subheading?: string;
  content: string;
  dimension?: string;
  ayahs?: AyahQuote[];
  hadiths?: HadithQuote[];
  salafQuotes?: SalafQuote[];
  propheticEvents?: PropheticEvent[];
}

export interface GeneratedContentResult {
  id?: string;
  title: string;
  subtitle?: string;
  contentType: string;
  audience: string;
  estimatedDuration: string;
  conceptDefinition?: string;
  introduction: string;
  sections: ContentSection[];
  misconceptions?: Misconception[];
  practicalApplications: string[];
  reflectionQuestions?: string[];
  conclusion: string;
  dua?: string;
  references: string[];
  verificationNotes: string[];
  qualityScore?: ArticleQualityScore;
  wordCount?: number;
  createdAt?: string;
}

export interface SavedGeneration {
  id: string;
  user_id?: string;
  content_type: string;
  topic: string;
  audience: string;
  length: string;
  style: string;
  evidence_level: string;
  instructions?: string;
  result: GeneratedContentResult;
  is_favorite?: boolean;
  created_at: string;
  updated_at: string;
}

export interface AIEditActionParams {
  currentContent: GeneratedContentResult;
  instruction: string;
  actionType?:
    | 'summarize'
    | 'expand'
    | 'simplify'
    | 'eloquent'
    | 'add_examples'
    | 'add_applications'
    | 'add_ayahs'
    | 'add_hadiths'
    | 'add_seerah'
    | 'expand_salaf'
    | 'linguistic_review'
    | 'tashkeel_review'
    | 'sharia_review'
    | 'convert_to_khutbah'
    | 'convert_to_lesson'
    | 'convert_to_post'
    | 'convert_to_social_series'
    | 'convert_to_script'
    | 'convert_to_discussion'
    | 'convert_to_family_activity'
    | 'convert_to_action_plan'
    | 'discussion_questions'
    | 'weekly_plan'
    | 'custom';
}

export interface AIEnhanceArticleParams {
  originalArticle: {
    id?: string;
    title: string;
    category?: string;
    contentType?: string;
    audience?: string;
    description?: string;
    content: string[] | string;
    references?: string[];
    ayahQuotes?: any[];
    hadithQuotes?: any[];
  };
  mode: 'expand_enrich' | 'rewrite_deepen';
  length?: AILength;
  detailLevel?: AIDetailLevel;
  tashkeel?: AITashkeel;
  evidenceLevel?: AIEvidenceLevel;
  targetAudience?: AIAudience;
  customInstructions?: string;
}
