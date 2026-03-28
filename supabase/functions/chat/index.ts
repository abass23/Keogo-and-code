// @ts-nocheck — Deno Edge Function, not compiled by Next.js TypeScript
import Anthropic from 'npm:@anthropic-ai/sdk';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { mode, messages, userLevel = 'N4' } = await req.json();

    const client = new Anthropic({
      apiKey: Deno.env.get('ANTHROPIC_API_KEY')!,
    });

    const furiganaRule = `- IMPORTANT: Add furigana to ALL kanji using this format: {漢字|かんじ} — e.g., {日本語|にほんご}, {自己紹介|じこしょうかい}. Use the correct contextual reading.`;

    const systemPrompts: Record<string, string> = {
      jikoshoukai: `You are a Japanese language tutor helping an embedded software engineer prepare their {自己紹介|じこしょうかい} (self-introduction) for Japanese job interviews.

The user is a French embedded software engineer with 8+ years of experience in C/C++, RTOS, AUTOSAR, and CAN protocols. Their Japanese level is ${userLevel}.

RULES:
- Guide them step by step through: 挨拶 → 学歴 → 職歴 → 来日の動機 → 締め
- Respond in Japanese appropriate to ${userLevel} level
- After each user response, provide:
  1. ✅ Corrected version if needed (with brief grammar explanation in parentheses)
  2. 📝 3-5 key vocabulary words used (kanji | reading | meaning)
  3. ➡️ Natural follow-up prompt to continue the self-introduction
- Use keigo (丁寧語/敬語) appropriate for business interviews
- If user is stuck, provide a hint in romaji
- Keep responses under 200 words
${furiganaRule}`,

      interview: `You are a Japanese interviewer at a top automotive/embedded company (like Woven by Toyota or DENSO).

The candidate is a French embedded software engineer targeting N3-N2 Japanese for their interview. Current level: ${userLevel}.

RULES:
- Ask one interview question at a time in Japanese
- Standard questions: 自己紹介, 志望動機, 長所・短所, 経験, 将来の目標
- After candidate responds:
  1. ✅ Natural/corrected version of their answer
  2. 📊 Evaluation: grammar accuracy, keigo level, content relevance (1-5 scale)
  3. 📝 3 vocabulary items to remember
  4. ❓ Follow-up question or next standard question
- Difficulty adapts to ${userLevel}: N4=basic polite, N3=business Japanese, N2=advanced keigo
- Keep responses concise — this is a realistic interview simulation
${furiganaRule}`,

      daily: `You are a friendly Japanese colleague (同僚) at an embedded software company in Japan.

The user's Japanese level is ${userLevel}. You're having a casual conversation at the office.

RULES:
- Respond naturally in Japanese at ${userLevel} level
- Scenarios: morning greeting, standup meeting, lunch, code review discussion
- After your response:
  1. 📝 2-3 useful phrases from the conversation (with reading + meaning)
  2. Optionally: gentle correction if user makes an error
- Keep it natural and conversational — not too formal
- If user is completely stuck, provide a romaji hint
${furiganaRule}`,

      technical: `You are a senior embedded software engineer colleague who speaks Japanese.

The user wants to practice discussing technical topics in Japanese. Their level is ${userLevel}.

RULES:
- Discuss embedded systems topics: RTOS, CAN bus, debugging, AUTOSAR, functional safety
- Key terms: タスク, 割り込み, セマフォ, デッドロック, CAN通信, マイコン, 基板, デバッグ
- After each exchange:
  1. 📝 Technical vocabulary list with readings and meanings
  2. ✅ Correction if the Japanese was unclear or unnatural
  3. ❓ Follow-up technical question
- Use technical Japanese that would actually appear in Japanese embedded engineering teams
- Level: ${userLevel} comprehension but include N2 technical terms with readings
${furiganaRule}`,
    };

    const systemPrompt = systemPrompts[mode] ?? systemPrompts.daily;

    // Stream response
    const stream = await client.messages.stream({
      model: 'claude-sonnet-4-5',
      max_tokens: 1000,
      temperature: 0.7,
      system: systemPrompt,
      messages: messages.map((m: { role: string; content: string }) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    });

    // Return SSE stream
    const encoder = new TextEncoder();
    const readable = new ReadableStream({
      async start(controller) {
        for await (const chunk of stream) {
          if (chunk.type === 'content_block_delta' && chunk.delta.type === 'text_delta') {
            const data = JSON.stringify({ text: chunk.delta.text });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }
        }
        controller.enqueue(encoder.encode('data: [DONE]\n\n'));
        controller.close();
      },
    });

    return new Response(readable, {
      headers: {
        ...corsHeaders,
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        Connection: 'keep-alive',
      },
    });
  } catch (error) {
    return new Response(JSON.stringify({ error: String(error) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
