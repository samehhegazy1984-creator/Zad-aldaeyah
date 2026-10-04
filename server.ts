import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
  buildGenerationPrompt,
  buildEditPrompt,
  buildEnhanceArticlePrompt,
} from './src/lib/ai/prompts';
import {
  validateGenerationParams,
  cleanAndParseAIJson,
} from './src/lib/ai/validation';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = parseInt(process.env.PORT || '3000', 10);
const isProd = process.env.NODE_ENV === 'production';

app.use(express.json({ limit: '2mb' }));

// Helper to get Gemini client
function getGeminiClient(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey || apiKey.trim() === '' || apiKey.includes('MY_GEMINI')) {
    return null;
  }
  return new GoogleGenAI({ apiKey });
}

// ==========================================
// API ROUTES
// ==========================================

// Cloud Run & Monitoring Health Check
app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

const DEFAULT_SUPABASE_URL = 'https://mnsorzmvnfkqsqbnjwgx.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_1h-o1nD5KU_IgA-dIlBidw_8mgoPylK';

// Safe public client config script (Supabase client keys only, NEVER secrets)
app.get('/env.js', (_req: Request, res: Response) => {
  res.type('application/javascript');
  res.send(
    `window.__ENV__ = ${JSON.stringify({
      SUPABASE_URL: process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL,
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY,
    })};`
  );
});

// Config / Health check route
app.get('/api/config', (_req: Request, res: Response) => {
  const supabaseUrl = process.env.SUPABASE_URL || DEFAULT_SUPABASE_URL;
  const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || DEFAULT_SUPABASE_ANON_KEY;

  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.includes('MY_GEMINI')
  );
  const hasSupabaseUrl = Boolean(
    supabaseUrl && !supabaseUrl.includes('MY_SUPABASE')
  );
  const hasSupabaseAnonKey = Boolean(
    supabaseAnonKey && !supabaseAnonKey.includes('MY_KEY')
  );
  const hasSupabase = hasSupabaseUrl && hasSupabaseAnonKey;

  res.json({
    status: 'ok',
    hasGeminiKey: hasGemini,
    hasSupabase,
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    supabaseUrl,
    supabaseAnonKey,
    dailyLimit: 10,
    model: 'gemini-3.8-flash',
  });
});

// AI Generation Endpoint
app.post('/api/ai/generate', async (req: Request, res: Response) => {
  try {
    const params = req.body;

    // 1. Validation
    const validation = validateGenerationParams(params);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.error,
      });
    }

    // 2. Check Gemini Client
    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error:
          'مفتاح GEMINI_API_KEY غير متوفر في بيئة الخادم. يرجى إضافته في إعدادات البيئة لتفعيل مساعد الذكاء الاصطناعي.',
      });
    }

    // 3. Construct Prompt
    const prompt = buildGenerationPrompt(params);

    // 4. Generate with Gemini
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
        temperature: 0.5,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const structuredResult = cleanAndParseAIJson(responseText);

    // Add unique ID
    structuredResult.id = `gen-${Date.now()}`;
    structuredResult.createdAt = new Date().toISOString();

    return res.json({
      success: true,
      data: structuredResult,
      metadata: {
        model: 'gemini-3.8-flash',
        generatedAt: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error('Error in /api/ai/generate:', error);
    const msg = error?.message || '';
    let userFriendlyError = 'حدث خطأ أثناء معالجة المادة الدعوية عبر الذكاء الاصطناعي. يرجى المحاولة بعد قليل.';

    if (msg.includes('leaked') || msg.includes('reported as leaked')) {
      userFriendlyError =
        'مفتاح GEMINI_API_KEY غير صالح (تم الإبلاغ عن تسريبه سابقاً). يرجى استخراج مفتاح جديد من Google AI Studio وإضافته في إعدادات البيئة / لوحة الأسرار.';
    } else if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      userFriendlyError = 'مفتاح GEMINI_API_KEY غير صالح أو انتهت صلاحيته.';
    } else if (msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'تم استهلاك الحصة المجانية لمفتاح Gemini مؤقتاً. يرجى المحاولة لاحقاً.';
    }

    return res.status(500).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// AI Follow-up Edit Endpoint
app.post('/api/ai/edit', async (req: Request, res: Response) => {
  try {
    const { currentContent, instruction, actionType } = req.body;

    if (!currentContent || (!instruction && !actionType)) {
      return res.status(400).json({
        success: false,
        error: 'البيانات المدخلة للتعديل غير مكتملة',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'مفتاح GEMINI_API_KEY غير متوفر في بيئة الخادم.',
      });
    }

    const editPrompt = buildEditPrompt({
      currentContent,
      instruction: instruction || '',
      actionType,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: editPrompt,
      config: {
        systemInstruction: ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
        temperature: 0.5,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const updatedResult = cleanAndParseAIJson(responseText);
    updatedResult.id = currentContent.id || `gen-${Date.now()}`;
    updatedResult.createdAt = currentContent.createdAt || new Date().toISOString();

    return res.json({
      success: true,
      data: updatedResult,
    });
  } catch (error: any) {
    console.error('Error in /api/ai/edit:', error);
    const msg = error?.message || '';
    let userFriendlyError = 'تعذر تطبيق التعديل المطلوب على المادة. يرجى المحاولة مرة أخرى.';

    if (msg.includes('leaked') || msg.includes('reported as leaked')) {
      userFriendlyError =
        'مفتاح GEMINI_API_KEY غير صالح (تم الإبلاغ عن تسريبه سابقاً). يرجى استخراج مفتاح جديد من Google AI Studio.';
    } else if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      userFriendlyError = 'مفتاح GEMINI_API_KEY غير صالح أو انتهت صلاحيته.';
    }

    return res.status(500).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// Enhance & Expand Existing Article Endpoint
app.post('/api/ai/enhance-article', async (req: Request, res: Response) => {
  try {
    const {
      originalArticle,
      mode,
      length,
      detailLevel,
      tashkeel,
      evidenceLevel,
      targetAudience,
      customInstructions,
    } = req.body;

    if (!originalArticle || !originalArticle.title) {
      return res.status(400).json({
        success: false,
        error: 'بيانات المقال الأصلي المراد تطويره غير مكتملة',
      });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'مفتاح GEMINI_API_KEY غير متوفر في بيئة الخادم. يرجى ضبطه لتفعيل التطوير التحريري.',
      });
    }

    const prompt = buildEnhanceArticlePrompt({
      originalArticle,
      mode: mode || 'expand_enrich',
      length: length || 'شاملة',
      detailLevel: detailLevel || 'شامل',
      tashkeel: tashkeel || 'تشكيل كامل',
      evidenceLevel: evidenceLevel || 'توثيق موسع',
      targetAudience,
      customInstructions,
    });

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
        temperature: 0.4,
        maxOutputTokens: 8192,
        responseMimeType: 'application/json',
      },
    });

    const responseText = response.text || '';
    const structuredResult = cleanAndParseAIJson(responseText);

    structuredResult.id = `gen-enh-${Date.now()}`;
    structuredResult.createdAt = new Date().toISOString();

    return res.json({
      success: true,
      data: structuredResult,
      metadata: {
        enhancedFromId: originalArticle.id,
        mode: mode || 'expand_enrich',
        model: 'gemini-3.8-flash',
      },
    });
  } catch (error: any) {
    console.error('Error in /api/ai/enhance-article:', error);
    const msg = error?.message || '';
    let userFriendlyError = 'حدث خطأ أثناء تطوير وتوسيع المقال. يرجى المحاولة مرة أخرى.';
    if (msg.includes('leaked') || msg.includes('reported as leaked')) {
      userFriendlyError = 'مفتاح GEMINI_API_KEY غير صالح أو تم الإبلاغ عن تسريبه سابقاً.';
    } else if (msg.includes('Quota exceeded') || msg.includes('RESOURCE_EXHAUSTED')) {
      userFriendlyError = 'تم استهلاك الحصة المجانية لمفتاح Gemini مؤقتاً. يرجى المحاولة لاحقاً.';
    }
    return res.status(500).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// Admin Writing Assistant Endpoint (Server-side Gemini proxy)
app.post('/api/admin/ai-assist', async (req: Request, res: Response) => {
  try {
    const { action, text, topic } = req.body;

    if (!action || (!text && !topic)) {
      return res.status(400).json({ success: false, error: 'المدخلات غير كافية' });
    }

    const ai = getGeminiClient();
    if (!ai) {
      return res.status(503).json({
        success: false,
        error: 'مفتاح GEMINI_API_KEY غير متوفر في الخادم.',
      });
    }

    const promptInstructions: Record<string, string> = {
      improve_wording: 'أعد صياغة هذا النص الشرعي/الدعوي بأسلوب عربي فصيح، رصين، بليغ ومؤثر، مع الحفاظ التام على المعنى، دون اختراع أدلة.',
      suggest_title: 'اقترح 3 عناوين دعوية وتربوية جذابة ومؤثرة للموضوع أو النص المعطى، كل عنوان في سطر مستقل وبدون ترقيم.',
      suggest_intro: 'اكتب مقدمة مؤثرة جامعة تمهد لموضوع المادة وتجذب انتباه القارئ أو المستمع بأسلوب إيماني رصين.',
      suggest_conclusion: 'اكتب خاتمة جامعة تلخص الفكرة وتختم بوصية قلبية ودعاء مأثور مبارك مناسب للموضوع.',
      expand: 'أثرِ هذا النص بتوضيح أوسع، وتطبيقات عملية واقعية، وبيان الأثر التربوي، بلغة راقية.',
      shorten: 'لخص هذا النص إلى فقرته الجوهرية المكثفة مع الحفاظ التام على الرسالة الأساسية وبلاغة العبارة.',
    };

    const instruction = promptInstructions[action] || 'قم بتحسين الصياغة';

    const prompt = `أنت مساعد التحرير اللغوي لمنصة "زاد الداعية".
المهمة المطلوبة: ${instruction}
الموضوع أو السياق: ${topic || 'مادة دعوية تربوية'}
النص المستهدف:
"""
${text || topic}
"""

ضوابط صارمة:
1. التزم بلغة عربية فصحى نقية وسليمة.
2. لا تخترع أي آيات أو أحاديث أو فتاوى.
3. أعطِ الصياغة المحسنة مباشرة بدون شروح خارجية.`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction: ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
        temperature: 0.3,
      },
    });

    const output = response.text?.trim() || '';
    return res.json({ success: true, result: output });
  } catch (error: any) {
    console.error('Error in /api/admin/ai-assist:', error);
    const msg = error?.message || '';
    let userFriendlyError = 'تعذر استدعاء مساعد التحرير الذكي. يرجى المحاولة لاحقاً.';
    if (msg.includes('leaked') || msg.includes('reported as leaked')) {
      userFriendlyError =
        'مفتاح GEMINI_API_KEY غير صالح (تم الإبلاغ عن تسريبه سابقاً). يرجى إضافة مفتاح جديد لتفعيل المساعد الذكي.';
    } else if (msg.includes('API key not valid') || msg.includes('API_KEY_INVALID')) {
      userFriendlyError = 'مفتاح GEMINI_API_KEY غير صالح أو انتهت صلاحيته.';
    }
    return res.status(500).json({
      success: false,
      error: userFriendlyError,
    });
  }
});

// ==========================================
// STATIC & VITE MIDDLEWARE
// ==========================================

async function startServer() {
  const distPath = path.resolve(process.cwd(), 'dist');
  const hasDist = fs.existsSync(path.resolve(distPath, 'index.html'));

  const isProduction =
    process.env.BUILD_TARGET === 'production' ||
    process.env.NODE_ENV === 'production' ||
    (hasDist && process.env.NODE_ENV !== 'development');

  if (isProduction) {
    console.log(`[Zad Al-Da'iyah] Serving production static assets from: ${distPath}`);
    app.use(express.static(distPath));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  } else {
    console.log(`[Zad Al-Da'iyah] Starting development Vite middleware...`);
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zad Al-Da'iyah] Starting Zad Al-Da'iyah production server...`);
    console.log(`[Zad Al-Da'iyah] Listening on port: ${PORT} (0.0.0.0)`);
    console.log(`[Zad Al-Da'iyah] Health check ready at http://0.0.0.0:${PORT}/health`);
  });

  // Graceful shutdown for Cloud Run container lifecycle
  process.on('SIGTERM', () => {
    console.log(`[Zad Al-Da'iyah] Received SIGTERM signal, closing server gracefully...`);
    server.close(() => {
      process.exit(0);
    });
  });
}

startServer();
