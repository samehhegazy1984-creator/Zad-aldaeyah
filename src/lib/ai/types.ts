export type AIContentType =
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
  | 'برنامج إيماني';

export type AIAudience =
  | 'عامة المسلمين'
  | 'الشباب'
  | 'الأطفال'
  | 'الآباء والأمهات'
  | 'المعلمون'
  | 'الدعاة'
  | 'طلاب العلم';

export type AILength =
  | 'شاملة'
  | 'مطولة'
  | 'متوسطة'
  | 'مختصرة'
  | 'قصيرة'
  | '10 دقائق'
  | '20 دقيقة'
  | '30 دقيقة'
  | '45 دقيقة'
  | 'ساعة'
  | 'مقال متوسط'
  | 'مقال طويل';

export type AITashkeel = 'تشكيل كامل' | 'تشكيل جزئي' | 'بدون تشكيل';

export type AIDetailLevel = 'متعمق' | 'بحثي' | 'متوسط' | 'مختصر';

export type AIStyle =
  | 'عربي واضح'
  | 'عربي جزيل'
  | 'تربوي'
  | 'مؤثر'
  | 'قصصي'
  | 'أكاديمي'
  | 'مبسط'
  | 'حواري';

export type AIEvidenceLevel = 'مختصر' | 'متوسط' | 'موثق';

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
}

export interface HadithQuote {
  text: string;
  narrator?: string;
  source?: string;
  grade?: string;
}

export interface ContentSection {
  heading: string;
  content: string;
  ayahs?: AyahQuote[];
  hadiths?: HadithQuote[];
}

export interface GeneratedContentResult {
  id?: string;
  title: string;
  contentType: string;
  audience: string;
  estimatedDuration: string;
  introduction: string;
  sections: ContentSection[];
  practicalApplications: string[];
  conclusion: string;
  dua?: string;
  references: string[];
  verificationNotes: string[];
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
    | 'convert_to_post'
    | 'convert_to_script'
    | 'discussion_questions'
    | 'weekly_plan'
    | 'custom';
}
