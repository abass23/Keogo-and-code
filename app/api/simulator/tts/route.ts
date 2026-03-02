import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

const ALLOWED_VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer'] as const;
type Voice = (typeof ALLOWED_VOICES)[number];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const text: string = body.text;
    const speed: number = Math.min(4.0, Math.max(0.25, Number(body.speed ?? 1.0)));
    const voice: Voice = ALLOWED_VOICES.includes(body.voice) ? body.voice : 'nova';

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Missing text' }, { status: 400 });
    }

    const mp3 = await openai.audio.speech.create({
      model: 'tts-1',
      voice,
      input: text,
      response_format: 'mp3',
      speed,
    });

    const buffer = Buffer.from(await mp3.arrayBuffer());

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('[/api/tts]', err);
    return NextResponse.json({ error: 'TTS request failed' }, { status: 500 });
  }
}
