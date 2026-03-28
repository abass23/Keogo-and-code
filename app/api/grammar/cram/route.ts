import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import grammarData from '@/data/grammar-n5-n4.json';
import type { GrammarPoint, JlptLevel, GrammarCategory } from '@/lib/grammar-types';

/**
 * POST /api/grammar/cram
 * Returns a cram session set of exercises — no SRS impact.
 * Body: { level?, category?, count? }
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await req.json();
  const level = body.level as JlptLevel | undefined;
  const category = body.category as GrammarCategory | undefined;
  const count = Math.min(Number(body.count ?? 10), 30);

  let { data: points, error } = await supabase
    .from('grammar_points')
    .select('*, grammar_exercises(*)')
    .order('sort_order');

  if (error || !points?.length) {
    // Fallback to seed data
    let seedPoints = grammarData as GrammarPoint[];
    if (level) seedPoints = seedPoints.filter((p) => p.jlpt_level === level);
    if (category) seedPoints = seedPoints.filter((p) => p.category === category);
    // Shuffle and take count
    const shuffled = seedPoints.sort(() => Math.random() - 0.5).slice(0, count);
    return NextResponse.json({ data: shuffled, is_cram: true });
  }

  if (level) points = points.filter((p) => p.jlpt_level === level);
  if (category) points = points.filter((p) => p.category === category);

  const shuffled = points.sort(() => Math.random() - 0.5).slice(0, count);

  return NextResponse.json({ data: shuffled, is_cram: true });
}
