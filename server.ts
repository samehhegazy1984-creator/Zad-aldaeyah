import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import { GoogleGenAI } from '@google/genai';
import {
  ISLAMIC_AI_SYSTEM_INSTRUCTIONS,
  buildGenerationPrompt,
  buildEditPrompt,
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

// Safe public client config script (Supabase client keys only, NEVER secrets)
app.get('/env.js', (_req: Request, res: Response) => {
  res.type('application/javascript');
  res.send(
    `window.__ENV__ = ${JSON.stringify({
      SUPABASE_URL: process.env.SUPABASE_URL || '',
      SUPABASE_ANON_KEY: process.env.SUPABASE_ANON_KEY || '',
    })};`
  );
});

// Config / Health check route
app.get('/api/config', (_req: Request, res: Response) => {
  const hasGemini = Boolean(
    process.env.GEMINI_API_KEY &&
    !process.env.GEMINI_API_KEY.includes('MY_GEMINI')
  );
  const hasSupabaseUrl = Boolean(
    process.env.SUPABASE_URL &&
    !process.env.SUPABASE_URL.includes('MY_SUPABASE')
  );
  const hasSupabaseAnonKey = Boolean(
    process.env.SUPABASE_ANON_KEY &&
    !process.env.SUPABASE_ANON_KEY.includes('MY_KEY')
  );
  const hasSupabase = hasSupabaseUrl && hasSupabaseAnonKey;

  res.json({
    status: 'ok',
    hasGeminiKey: hasGemini,
    hasSupabase,
    hasSupabaseUrl,
    hasSupabaseAnonKey,
    supabaseUrl: hasSupabaseUrl ? process.env.SUPABASE_URL : '',
    supabaseAnonKey: hasSupabaseAnonKey ? process.env.SUPABASE_ANON_KEY : '',
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
  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Zad Al-Da'iyah] Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
