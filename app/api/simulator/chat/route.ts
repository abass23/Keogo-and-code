import { NextRequest, NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { getSystemPrompt } from '@/lib/simulatorScenarios';
import type { ChatRequest, ChatResponse } from '@/lib/simulatorTypes';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY!);

export async function POST(req: NextRequest) {
  try {
    const body: ChatRequest = await req.json();
    const { scenario, history, userMessage } = body;

    if (!scenario || !userMessage) {
      return NextResponse.json({ error: 'Missing scenario or userMessage' }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash',
      systemInstruction: getSystemPrompt(scenario),
      generationConfig: {
        responseMimeType: 'application/json',
        temperature: 0.7,
        maxOutputTokens: 600,
      },
    });

    // Gemini uses 'user' | 'model' roles (not 'assistant')
    const geminiHistory = history.map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    }));

    const chat = model.startChat({ history: geminiHistory });
    const result = await chat.sendMessage(userMessage);
    const raw = result.response.text();
    const parsed: ChatResponse = JSON.parse(raw);

    return NextResponse.json(parsed);
  } catch (err) {
    console.error('[/api/simulator/chat]', err);
    return NextResponse.json({ error: 'AI request failed' }, { status: 500 });
  }
}
