import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';
import { getSystemPrompt } from '@/lib/simulatorScenarios';
import type { ChatRequest, ChatResponse } from '@/lib/simulatorTypes';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { scenario, history, userMessage } = body;

    if (!scenario || !userMessage) {
      return NextResponse.json({ error: 'Missing scenario or userMessage' }, { status: 400 });
    }

    const systemPrompt = getSystemPrompt(scenario);

    const messages: OpenAI.Chat.ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...history,
      { role: 'user', content: userMessage },
    ];

    const completion = await openai.chat.completions.create({
      model: 'gpt-4o',
      messages,
      response_format: { type: 'json_object' },
      temperature: 0.7,
      max_tokens: 600,
    });

    const raw = completion.choices[0]?.message?.content ?? '{}';
    const parsed: ChatResponse = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/simulator/chat]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
