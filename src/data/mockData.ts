import {
  CategoryInfo,
  ContentTypeInfo,
  AudienceInfo,
  FAQItem,
  ContentItem,
} from '../types';
import { CONTENT_DATABASE } from './content';
import { CATEGORIES_LIST } from './categories';
import { AUTHORS_DATA } from './authors';

export { CONTENT_DATABASE } from './content';
export { CATEGORIES_LIST } from './categories';
export { AUTHORS_DATA } from './authors';

export const CATEGORIES_DATA: CategoryInfo[] = CATEGORIES_LIST.map((c) => ({
  id: c.id,
  name: c.name,
  description: c.description,
  materialsCount: c.contentCount,
  iconName: c.icon,
  slug: c.slug,
}));

export const CONTENT_TYPES_DATA: ContentTypeInfo[] = [
  {
    id: 'khutbah-juma',
    title: 'خطبة جمعة',
    description: 'هيكل متكامل للخطبة الأولى والثانية مدعّم بالأدلة والأثر والشواهد المعاصرة.',
    iconName: 'Scroll',
    typicalDuration: '15-20 دقيقة',
  },
  {
    id: 'khutbah-eid',
    title: 'خطبة عيد',
    description: 'خطبة جامعة للأعياد تجمع بين معاني الشكر والفرح وصلة الأرحام وتفقد المحتاجين.',
    iconName: 'Calendar',
    typicalDuration: '8-12 دقيقة',
  },
  {
    id: 'mawiza',
    title: 'موعظة',
    description: 'كلمة وجدانية رقيقة ترقق القلوب وتدعو إلى التوبة وتذكر بالدار الآخرة.',
    iconName: 'Heart',
    typicalDuration: '10 دقائق',
  },
  {
    id: 'dars',
    title: 'درس',
    description: 'طرح منهجي موثق يشرح مسألة شرعية أو يعلق على باب من أبواب العلم النافع.',
    iconName: 'BookOpen',
    typicalDuration: '30-45 دقيقة',
  },
  {
    id: 'lecture',
    title: 'محاضرة',
    description: 'معالجة فكرية أو دعوية موسعة تتناول ظاهرة أو موضوعاً مجتمعياً بالتفصيل.',
    iconName: 'Layers',
    typicalDuration: '40-60 دقيقة',
  },
  {
    id: 'short-talk',
    title: 'كلمة قصيرة',
    description: 'خواطر مركزة وخفيفة تناسب ما بعد الصلاة أو المجالس السريعة.',
    iconName: 'Clock',
    typicalDuration: '5-7 دقائق',
  },
  {
    id: 'kids-lesson',
    title: 'درس للأطفال',
    description: 'قصص ومفاهيم مبسطة مشفوعة بأنشطة تفاعلية وأمثلة بصرية ملهمة للصغار.',
    iconName: 'Smile',
    typicalDuration: '15 دقيقة',
  },
  {
    id: 'educational',
    title: 'مادة تربوية',
    description: 'دليل عملي للمربين والمعلمين لحل المشكلات السلوكية وغرس الفضائل.',
    iconName: 'GraduationCap',
    typicalDuration: 'دليل قراءة',
  },
  {
    id: 'family-talk',
    title: 'مادة أسرية',
    description: 'حديث هادئ يجمع الأسرة حول مائدة الإيمان ويعزز التراحم والاحترام المتبادل.',
    iconName: 'Home',
    typicalDuration: '12 دقيقة',
  },
  {
    id: 'dawah-post',
    title: 'منشور دعوي',
    description: 'صياغة رقمية مكثفة ومختصرة صالحة للنشر والتداول عبر منصات التواصل.',
    iconName: 'Share2',
    typicalDuration: 'دقيقة قراءة',
  },
  {
    id: 'video-script',
    title: 'سيناريو فيديو',
    description: 'نص إثرائي مشهدي مجهز بصرياً ومقطعاً لإنتاج مقاطع الفيديو القصيرة والريلز.',
    iconName: 'Video',
    typicalDuration: '90 ثانية',
  },
  {
    id: 'iman-program',
    title: 'برنامج إيماني',
    description: 'خطط وجداول إيمانية دورية متدرجة لصناعة العادات الصالحة والثبات على الطاعة.',
    iconName: 'Sparkles',
    typicalDuration: 'برنامج تطبيقي',
  },
];

export const AUDIENCES_DATA: AudienceInfo[] = [
  {
    id: 'all',
    title: 'الجميع',
    description: 'خطاب جامع يخاطب الضمير الإنساني والمسلم بأسلوب يسير وواضح للكل.',
    iconName: 'Globe',
  },
  {
    id: 'muslims',
    title: 'عامة المسلمين',
    description: 'توجيهات إيمانية تركز على تصحيح العبادات وتزكية السلوك وبث الطمأنينة.',
    iconName: 'Heart',
  },
  {
    id: 'youth',
    title: 'الشباب',
    description: 'قضايا الهوية وبناء الثقة في مواجهة التحديات الفكرية والاستهلاكية.',
    iconName: 'Sparkles',
  },
  {
    id: 'children',
    title: 'الأطفال',
    description: 'قصص وقيم إيمانية محببة للأعمار الأولى بأسلوب مبهج وبسيط.',
    iconName: 'Smile',
  },
  {
    id: 'parents',
    title: 'الآباء والأمهات',
    description: 'أدوات الحوار والتربية الإيجابية وحماية البيت وبناء الأسرة المطمئنة.',
    iconName: 'Users',
  },
  {
    id: 'teachers',
    title: 'المعلمون',
    description: 'توجيه تربوي يربط المنهاج بالقيم وغرس الأخلاق والقدوة الحية.',
    iconName: 'BookOpen',
  },
  {
    id: 'daia',
    title: 'الدعاة',
    description: 'فقه الدعوة بالحكمة والموعظة الحسنة وأساليب التأثير الوجداني والفكري.',
    iconName: 'Compass',
  },
  {
    id: 'students',
    title: 'طلاب العلم',
    description: 'تأصيل شرعي وفقه الاستدلال وفهم المقاصد وأدب الخلاف والائتلاف.',
    iconName: 'GraduationCap',
  },
];

export const FAMILY_EDUCATION_CARDS = [
  {
    id: 'mosque',
    place: 'في المسجد',
    description: 'المنبر والمحراب ومجالس الذكر بين الصلوات لنشر العلم والسكينة.',
    badge: 'مكان الاجتماع الأكبر',
  },
  {
    id: 'school',
    place: 'في المدرسة',
    description: 'طابور الصباح، الإذاعة المدرسية، وحصص التوجيه لبناء جيل يعتز بهويته.',
    badge: 'غرس البدايات',
  },
  {
    id: 'home',
    place: 'في البيت',
    description: 'جلسات السمر الأسرية، ومناقشة التحديات برفق ومحبة وتفهم متبادل.',
    badge: 'عماد الاستقرار',
  },
  {
    id: 'family-circle',
    place: 'في الأسرة',
    description: 'لقاءات الأرحام، والتواصل الإيجابي مع الأجداد والأحفاد لتعزيز الترابط.',
    badge: 'صلة الرحم',
  },
  {
    id: 'social-media',
    place: 'في وسائل التواصل',
    description: 'صناعة المحتوى الهادف ومزاحمة الغث بالسمين بأسلوب عصري محبب وجذاب.',
    badge: 'الفضاء المفتوح',
  },
];

export const HOW_IT_WORKS_STEPS = [
  {
    number: '01',
    title: 'اكتب فكرتك',
    description: 'دوّن الفكرة الأساسية أو القضية التي تشغل بالك، بكلماتك العفوية أو عنوان مقترح.',
  },
  {
    number: '02',
    title: 'حدد جمهورك وهدفك',
    description: 'اختر الفئة المستهدفة (مصلون، شباب، أولياء أمور) ونوع المنبر والزمن المتاح للإلقاء.',
  },
  {
    number: '03',
    title: 'ابدأ صناعة المادة',
    description: 'احصل على هيكل رصين يجمع بين أصالة النص القرآني والنبوي، والمعالجة التربوية الواقعية.',
  },
  {
    number: '04',
    title: 'راجع، عدّل، وانشر',
    description: 'أضف لمستك وتجاربك الشخصية، واحفظ مادتك في مكتبتك الخاصة أو شاركها مع الآخرين.',
    isFuture: true,
  },
];

export const FAQ_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'ما هي زاد الداعية؟',
    answer:
      'زاد الداعية هي منصة معرفية وتربوية حديثة صُممت لتكون عوناً لكل من يحمل رسالة؛ من خطباء، ومعلمين، ومربين، وآباء وأمهات، وصناع محتوى. نهدف إلى تيسير الوصول إلى المعنى، وصياغة الكلمة النافعة المبنية على أصول شرعية أصيلة بأسلوب يناسب العصر.',
  },
  {
    id: 'faq-2',
    question: 'لمن صُممت المنصة؟',
    answer:
      'المنصة مصممة لكل صاحب كلمة نافعة: خطباء الجمعة، المدرسون والموجهون التربويون، الدعاة في المراكز المجتمعية، الآباء والأمهات الراغبون في تعزيز القيم الأسرية، وصناع المحتوى الإسلامي الرقمي، وطلاب العلم.',
  },
  {
    id: 'faq-3',
    question: 'هل المنصة مجانية؟',
    answer:
      'نعم، المواد الأساسية في مكتبة المعرفة وخصائص القراءة والمشاركة وحفظ المفضلة متاحة مجاناً لجميع المسلمين، انطلاقاً من مبدأ نشر العلم النافع وتيسير الخير للجميع.',
  },
  {
    id: 'faq-4',
    question: 'هل يمكن البحث داخل المواد؟',
    answer:
      'بكل تأكيد. توفر المنصة محرك بحث سريع ودقيق يدعم معالجة اللغة العربية ومرونة الكلمات، ويتيح تصفية المحتوى حسب المجال، ونوع المادة، والجمهور المستهدف، والمدة الزمنية المقدرة للقراءة أو الإلقاء.',
  },
  {
    id: 'faq-5',
    question: 'هل يمكن إنشاء خطبة بالذكاء الاصطناعي؟',
    answer:
      'تم تصميم الواجهة الحالية لإتاحة تجربة تفاعلية لمحاكاة التوليد الإرشادي، وفي المرحلة القادمة سيتم ربط نموذج ذكاء اصطناعي مدرب خصيصاً على الأصول الشرعية لمساعدة الداعية في هيكلة الأفكار واستدعاء الأدلة المناسبة دون أن يستبدل الجهد الإنساني والروحي للخطيب.',
  },
  {
    id: 'faq-6',
    question: 'هل يمكن حفظ المواد؟',
    answer:
      'نعم، يمكنك النقر على زر "حفظ في المفضلة" على أي مادة أو خطبة لتصل إليها في أي وقت عبر صفحة المفضلة الخاصة بك، حتى بدون الحاجة للبحث عنها مجدداً.',
  },
  {
    id: 'faq-7',
    question: 'هل يمكن طباعة المادة؟',
    answer:
      'نعم، تحتوي قارئة المواد على ميزة الطباعة بنسخة نظيفة مخصصة ومريحة للمنبر والمجالس مع إخفاء كافة الأزرار غير الضرورية تلقائياً، مع إمكانية تكبير الخط أو تصغيره واختيار الوضع المناسب للقراءة.',
  },
  {
    id: 'faq-8',
    question: 'كيف يتم التحقق من الأدلة الشرعية؟',
    answer:
      'تعتمد مواد المنصة على القرآن الكريم وتفاسيره المعتبرة، والسنة النبوية الصحيحة أو الحسنة المحررة من كتب الصحاح والسنن، مع تخريج الأحاديث وعزوها لمصادرها، مع التأكيد الدائم على أن المنصة أداة إعداد وتأليف وليست جهة إفتاء شرعي رسمي.',
  },
];

// Re-export full 30 content database as ARTICLES_DATA
export const ARTICLES_DATA: ContentItem[] = CONTENT_DATABASE;
