import { AIGenerationParams, GeneratedContentResult } from './types';

export function validateGenerationParams(params: any): { isValid: boolean; error?: string } {
  if (!params) {
    return { isValid: false, error: 'بيانات الطلب مفقودة' };
  }
  if (!params.topic || typeof params.topic !== 'string' || params.topic.trim().length < 3) {
    return { isValid: false, error: 'يرجى كتابة فكرة أو موضوع المادة بشكل واضح (على الأقل 3 أحرف)' };
  }
  if (!params.contentType) {
    return { isValid: false, error: 'يرجى تحديد نوع المادة' };
  }
  if (!params.audience) {
    return { isValid: false, error: 'يرجى تحديد الفئة المستهدفة' };
  }
  return { isValid: true };
}

export function cleanAndParseAIJson(rawText: string): GeneratedContentResult {
  if (!rawText) {
    throw new Error('لم يتم استلام أي رد من نموذج الذكاء الاصطناعي');
  }

  // Strip code fences if present
  let cleaned = rawText.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.substring(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.substring(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.substring(0, cleaned.length - 3);
  }
  cleaned = cleaned.trim();

  try {
    const parsed = JSON.parse(cleaned);
    
    // Ensure minimal required structure
    return {
      title: parsed.title || 'مادة دعوية نافعة',
      contentType: parsed.contentType || 'مادة علمية',
      audience: parsed.audience || 'عامة المسلمين',
      estimatedDuration: parsed.estimatedDuration || '15 دقيقة',
      introduction: parsed.introduction || '',
      sections: Array.isArray(parsed.sections) ? parsed.sections : [],
      practicalApplications: Array.isArray(parsed.practicalApplications) ? parsed.practicalApplications : [],
      conclusion: parsed.conclusion || '',
      dua: parsed.dua || '',
      references: Array.isArray(parsed.references) ? parsed.references : [],
      verificationNotes: Array.isArray(parsed.verificationNotes) ? parsed.verificationNotes : [],
    };
  } catch (err: any) {
    console.error('Failed to parse AI JSON:', cleaned);
    throw new Error('تعذر معالجة الرد البرمجي من النموذج. يرجى المحاولة مرة أخرى.');
  }
}
