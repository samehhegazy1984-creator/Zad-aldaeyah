import { Category } from '../types';

export const CATEGORIES_LIST: Category[] = [
  {
    id: 'faith',
    slug: 'faith',
    name: 'الإيمان والعقيدة',
    description: 'ترسيخ اليقين، محبة الله، وأصول التوحيد في القلوب وسلوك الحياة اليومية.',
    icon: 'Shield',
    contentCount: 142,
  },
  {
    id: 'quran',
    slug: 'quran',
    name: 'القرآن',
    description: 'تدبر آيات التنزيل، فهم المقاصد، والعيش مع رسائل الكتاب الحكيم.',
    icon: 'BookOpen',
    contentCount: 188,
  },
  {
    id: 'salah',
    slug: 'salah',
    name: 'الصلاة',
    description: 'فقه الخشوع، استحضار القلب، وأثر الصلوات في السكينة وبناء المسلم.',
    icon: 'Compass',
    contentCount: 96,
  },
  {
    id: 'seerah',
    slug: 'seerah',
    name: 'السيرة النبوية',
    description: 'مواقف من حياة المصطفى ﷺ نستخلص منها معالم القيادة والرحمة والمنهج.',
    icon: 'Compass',
    contentCount: 130,
  },
  {
    id: 'tazkiyah',
    slug: 'tazkiyah',
    name: 'تزكية النفس',
    description: 'مداواة أمراض القلوب، الصدق، التواضع، ومقامات العبودية والورع.',
    icon: 'Heart',
    contentCount: 120,
  },
  {
    id: 'ethics',
    slug: 'ethics',
    name: 'الأخلاق',
    description: 'السمت الصالح، حفظ اللسان، الصدق، الأمانة، وحسن المعاشرة مع الخلق.',
    icon: 'Feather',
    contentCount: 114,
  },
  {
    id: 'family',
    slug: 'family',
    name: 'الأسرة والتربية',
    description: 'المودة والرحمة، غرس المبادئ في الأبناء، والتعامل الحكيم مع مشكلات البيت.',
    icon: 'Users',
    contentCount: 165,
  },
  {
    id: 'children-upbringing',
    slug: 'abnaa',
    name: 'الأبناء',
    description: 'منهج نبوي وعلمي في رعاية فلذات الأكباد ومرافقتهم في مراحل النمو والتربية.',
    icon: 'Smile',
    contentCount: 84,
  },
  {
    id: 'youth',
    slug: 'youth',
    name: 'الشباب',
    description: 'قضايا الهوية، إدارة الشبهات والشهوات، واكتشاف الطاقات وبناء الطموح الراشد.',
    icon: 'Sparkles',
    contentCount: 88,
  },
  {
    id: 'dawah',
    slug: 'dawah',
    name: 'الدعوة',
    description: 'أصول الحكمة والموعظة الحسنة، أساليب التأثير، وفقه مخاطبة الناس بالرفق.',
    icon: 'MessageSquare',
    contentCount: 85,
  },
  {
    id: 'society',
    slug: 'society',
    name: 'المجتمع',
    description: 'التكافل، صلة الأرحام، الإصلاح بين الناس، ونبذ العصبية والشائعات.',
    icon: 'Globe',
    contentCount: 102,
  },
  {
    id: 'ramadan',
    slug: 'ramadan',
    name: 'رمضان',
    description: 'استثمار الموسم العظيم، فقه الصيام والقيام، وتجديد العهد مع الله تعالى.',
    icon: 'Moon',
    contentCount: 92,
  },
  {
    id: 'hajj',
    slug: 'hajj',
    name: 'الحج والعمرة',
    description: 'أسرار المناسك، معاني التجريد والتلبية، ودروس المشاعر المقدسة في الإخلاص.',
    icon: 'MapPin',
    contentCount: 58,
  },
  {
    id: 'occasions',
    slug: 'occasions',
    name: 'المناسبات',
    description: 'الأعياد، مواسم الطاعات، وفضل الأيام الفاضلة وكيفية إحيائها بالخير.',
    icon: 'Calendar',
    contentCount: 66,
  },
  {
    id: 'kids',
    slug: 'children',
    name: 'الأطفال',
    description: 'قصص تربوية هادفة، تعليم المبادئ بأسلوب محبب ومناسب للفئات العمرية الأولى.',
    icon: 'Smile',
    contentCount: 78,
  },
];

export const getCategoryBySlug = (slug: string): Category | undefined => {
  return CATEGORIES_LIST.find((c) => c.slug === slug || c.id === slug);
};

export const getCategoryByName = (name: string): Category | undefined => {
  return CATEGORIES_LIST.find((c) => c.name === name);
};
