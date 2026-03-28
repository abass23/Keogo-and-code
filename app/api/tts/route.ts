import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { text, voice = 'ja-JP-Neural2-B', speed = 0.9 } = await req.json();

  const apiKey = process.env.GOOGLE_CLOUD_TTS_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: 'TTS key not configured' }, { status: 500 });
  }

  const response = await fetch(
    `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
    {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        input: { text },
        voice: { languageCode: 'ja-JP', name: voice },
        audioConfig: { audioEncoding: 'MP3', speakingRate: speed },
      }),
    },
  );

  const data = await response.json();
  if (!response.ok) {
    console.error('[TTS route] Google error:', JSON.stringify(data));
    return NextResponse.json({ error: data.error?.message ?? 'TTS API error' }, { status: 500 });
  }

  return NextResponse.json({ audioContent: data.audioContent });
}
