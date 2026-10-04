export type ContentTypeEnum =
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

export type CategoryEnum =
  | 'الإيمان والعقيدة'
  | 'القرآن'
  | 'الصلاة'
  | 'السيرة النبوية'
  | 'تزكية النفس'
  | 'الأخلاق'
  | 'الأسرة والتربية'
  | 'الأبناء'
  | 'الشباب'
  | 'الدعوة'
  | 'المجتمع'
  | 'رمضان'
  | 'الحج والعمرة'
  | 'المناسبات'
  | 'الأطفال';

export type AudienceEnum =
  | 'الجميع'
  | 'عامة المسلمين'
  | 'الشباب'
  | 'الأطفال'
  | 'الآباء والأمهات'
  | 'المعلمون'
  | 'الدعاة'
  | 'الخطيب'
  | 'طلاب العلم';

export interface Author {
  id: string;
  name: string;
  title: string;
  bio: string;
  avatar?: string;
}

export interface ContentSection {
  heading: string;
  subheading?: string;
  content: string;
  dimension?: string;
  ayahs?: {
    text: string;
    surah: string;
    number?: number;
    explanation?: string;
  }[];
  hadiths?: {
    text: string;
    narrator: string;
    source?: string;
    grade?: string;
    explanation?: string;
  }[];
  salafQuotes?: {
    scholar: string;
    statement: string;
    source?: string;
    era?: string;
  }[];
  propheticEvents?: {
    incident: string;
    lesson: string;
    context?: string;
  }[];
}

export interface ContentQualityScore {
  overall: number;
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

export interface Content {
  id: string;
  title: string;
  slug: string;
  description: string;
  content: string[];
  contentType: ContentTypeEnum;
  category: CategoryEnum;
  audience: AudienceEnum;
  author: Author;
  readingTime: number; // minutes
  tags: string[];
  featured: boolean;
  date: string;
  views: number;
  createdAt: string;
  subtitle?: string;
  conceptDefinition?: string;
  sections?: ContentSection[];
  propheticEvents?: {
    incident: string;
    lesson: string;
    context?: string;
  }[];
  salafQuotes?: {
    scholar: string;
    statement: string;
    source?: string;
    era?: string;
  }[];
  misconceptions?: {
    claim: string;
    correction: string;
    evidence?: string;
  }[];
  practicalApplications?: string[];
  reflectionQuestions?: string[];
  conclusion?: string;
  dua?: string;
  qualityScore?: ContentQualityScore;
  wordCount?: number;
  hasTashkeel?: boolean;
  references?: string[];
  ayahQuotes?: { text: string; surah: string; explanation?: string }[];
  hadithQuotes?: { text: string; narrator: string; source?: string; explanation?: string }[];
  keyTakeaways?: string[];
  status?: 'draft' | 'under_review' | 'published' | 'archived';
  seoTitle?: string;
  seoDescription?: string;
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
}

export interface Category {
  id: string;
  slug: string;
  name: CategoryEnum;
  description: string;
  icon: string;
  contentCount: number;
  status?: 'active' | 'inactive';
  sortOrder?: number;
}

export type UserRole = 'user' | 'editor' | 'admin';

export interface AdminActivityLog {
  id: string;
  user_id?: string;
  user_name: string;
  user_role: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'PUBLISH' | 'UNPUBLISH' | 'ARCHIVE' | 'ROLE_CHANGE' | 'LOGIN' | 'LOGOUT' | 'SETTINGS_UPDATE';
  entity_type: 'content' | 'category' | 'user' | 'role' | 'ai_material' | 'settings';
  entity_id?: string;
  details?: string;
  metadata?: Record<string, any>;
  created_at: string;
}

export interface PlatformSettings {
  id: string;
  site_name: string;
  tagline: string;
  site_description: string;
  admin_email: string;
  allow_registration: boolean;
  enable_ai_generation: boolean;
  ai_daily_limit: number;
  settings?: Record<string, any>;
  updated_at?: string;
}

export type AdminTab =
  | 'dashboard'
  | 'content'
  | 'content-new'
  | 'content-edit'
  | 'categories'
  | 'users'
  | 'ai-materials'
  | 'analytics'
  | 'settings'
  | 'activity-logs';

export interface ReadingHistoryItem {
  contentId: string;
  timestamp: number;
}

export type ActivePage =
  | 'home'
  | 'library'
  | 'favorites'
  | 'about'
  | 'content'
  | 'category'
  | 'article'
  | 'assistant'
  | 'login'
  | 'register'
  | 'account'
  | 'my-materials'
  | 'generated'
  | 'admin';

export type ReaderFontSize = 'small' | 'medium' | 'large' | 'xlarge';

export type SortOption = 'latest' | 'popular' | 'bookmarked' | 'alphabetical';

export interface SearchFilterState {
  query: string;
  contentType: string;
  category: string;
  audience: string;
  readingTime: string;
  tag: string;
  sortBy: SortOption;
}

// Backward-compatible type aliases for existing components
export type ContentCategoryType = CategoryEnum;
export type ContentFormatType = ContentTypeEnum;
export type TargetAudienceType = AudienceEnum;
export type ContentItem = Content;
export interface CategoryInfo {
  id: string;
  name: CategoryEnum;
  description: string;
  materialsCount: number;
  iconName: string;
  slug?: string;
}
export interface ContentTypeInfo {
  id: string;
  title: ContentTypeEnum;
  description: string;
  iconName: string;
  typicalDuration: string;
}
export interface AudienceInfo {
  id: string;
  title: AudienceEnum;
  description: string;
  iconName: string;
}
export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category?: string;
}
