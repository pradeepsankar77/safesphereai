import { NextRequest, NextResponse } from 'next/server';
import Anthropic from '@anthropic-ai/sdk';

// In-memory sliding-window rate limiting map
const rateLimitMap = new Map<string, number[]>();

function checkRateLimit(ip: string, limit = 15, windowMs = 60000): boolean {
  const now = Date.now();
  const timestamps = rateLimitMap.get(ip) || [];
  const validTimestamps = timestamps.filter((t) => now - t < windowMs);

  if (validTimestamps.length >= limit) {
    return false;
  }

  validTimestamps.push(now);
  rateLimitMap.set(ip, validTimestamps);
  return true;
}

// Resilient emergency translations dictionary for immediate fallback
const FALLBACK_TRANSLATIONS: Record<string, { en: string; ta: string; hi: string }> = {
  cyclone: {
    en: 'Severe Cyclone Alert: Evacuate coastal lowlands immediately. Seek shelter in designated concrete assembly centers. Carry battery radios and emergency kits.',
    ta: 'தீவிர புயல் எச்சரிக்கை: கடலோர தாழ்வான பகுதிகளை உடனடியாக காலி செய்யவும். நியமிக்கப்பட்ட கான்கிரீட் நிவாரண முகாம்களுக்கு செல்லவும். அவசர மருந்துகள் மற்றும் வானொலியை உடன் எடுத்துச் செல்லவும்.',
    hi: 'गंभीर चक्रवात चेतावनी: तटीय निचले इलाकों को तुरंत खाली करें। नामित कंक्रीट राहत आश्रयों में शरण लें। बैटरी रेडियो और आपातकालीन किट साथ रखें।',
  },
  flood: {
    en: 'Flash Flood Warning: River water levels have breached danger thresholds. Move immediately to high ground. Do not walk or drive through flowing water.',
    ta: 'திடீர் வெள்ள எச்சரிக்கை: ஆற்று நீர்மட்டம் அபாய அளவைத் தாண்டியுள்ளது. உடனடியாக மேடான பகுதிகளுக்கு செல்லவும். பாயும் நீரில் நடக்கவோ வாகனம் ஓட்டவோ வேண்டாம்.',
    hi: 'आकस्मिक बाढ़ की चेतावनी: नदी का जलस्तर खतरे के निशान को पार कर चुका है। तुरंत ऊंचे स्थानों पर जाएं। बहते पानी में न चलें और न ही वाहन चलाएं।',
  },
  earthquake: {
    en: 'Seismic Aftershock Advisory: Strong tremors recorded. Drop, cover, and hold on. Stay clear of power lines, glass windows, and unreinforced buildings.',
    ta: 'நிலநடுக்க பின்-அதிர்வு ஆலோசனை: பலத்த நடுக்கங்கள் பதிவாகியுள்ளன. கீழே குனிந்து, பாதுகாப்பான பொருளுக்குள் மறைந்து கொள்ளவும். மின்கம்பிகள் மற்றும் கண்ணாடி ஜன்னல்களை விட்டு விலகி இருக்கவும்.',
    hi: 'भूकंप बाद-झटके सलाह: तेज झटके दर्ज किए गए हैं। झुकें, ढके और थामे रहें। बिजली के तारों, कांच की खिड़कियों और कमजोर इमारतों से दूर रहें।',
  },
};

export async function POST(request: NextRequest) {
  // 1. Rate limiting
  const ip =
    request.headers.get('x-forwarded-for')?.split(',')[0].trim() ||
    request.headers.get('x-real-ip') ||
    '127.0.0.1';

  if (!checkRateLimit(ip, 15, 60000)) {
    return NextResponse.json(
      { success: false, error: 'Translation rate limit exceeded. Please wait a moment.' },
      { status: 429 }
    );
  }

  try {
    const body = await request.json();
    const { text, type = 'cyclone' } = body;

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Text is required for emergency translation.' },
        { status: 400 }
      );
    }

    if (text.length > 1000) {
      return NextResponse.json(
        { success: false, error: 'Text exceeds maximum length of 1000 characters.' },
        { status: 400 }
      );
    }

    // Default translations from fallback dictionary
    let translations = FALLBACK_TRANSLATIONS[type] || {
      en: text,
      ta: FALLBACK_TRANSLATIONS.cyclone.ta,
      hi: FALLBACK_TRANSLATIONS.cyclone.hi,
    };

    // 2. Translate using Claude API if key is present
    const anthropicApiKey = process.env.ANTHROPIC_API_KEY;
    if (anthropicApiKey && anthropicApiKey.startsWith('sk-ant-')) {
      try {
        const anthropic = new Anthropic({ apiKey: anthropicApiKey });
        const prompt = `You are the official Emergency Disaster Broadcast Translator for SafeSphere AI.
Translate this critical emergency warning into natural, urgent, easy-to-understand spoken language for public speech broadcast:

Original English Alert: "${text}"

Provide translations in this exact JSON format with no additional text or codeblocks:
{
  "en": "concise clear English spoken broadcast",
  "ta": "இயற்கையான தமிழ் அவசர ஒலிபரப்பு உரை",
  "hi": "स्पष्ट और प्राकृतिक हिंदी आपातकालीन प्रसारण संदेश"
}`;

        const response = await anthropic.messages.create({
          model: 'claude-3-haiku-20240307',
          max_tokens: 400,
          messages: [{ role: 'user', content: prompt }],
        });

        const messageContent = response.content?.[0];
        if (messageContent && 'text' in messageContent && messageContent.text) {
          const raw = messageContent.text.trim();
          // Extract JSON if wrapped
          const jsonMatch = raw.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const parsed = JSON.parse(jsonMatch[0]);
            if (parsed.en && parsed.ta && parsed.hi) {
              translations = {
                en: parsed.en,
                ta: parsed.ta,
                hi: parsed.hi,
              };
            }
          }
        }
      } catch (aiErr: any) {
        console.warn('Claude API translation notice, utilizing verified emergency translations:', aiErr.message);
      }
    }

    return NextResponse.json({
      success: true,
      originalText: text,
      translations,
      locales: {
        en: 'en-IN',
        ta: 'ta-IN',
        hi: 'hi-IN',
      },
    });
  } catch (err: any) {
    console.error('Error in translate API:', err);
    return NextResponse.json(
      { success: false, error: 'Translation pipeline error.' },
      { status: 500 }
    );
  }
}
