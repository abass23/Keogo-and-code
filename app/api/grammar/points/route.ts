import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import grammarData from '@/data/grammar-n5-n4.json';
import type { GrammarPoint, JlptLevel, GrammarCategory } from '@/lib/grammar-types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const level = searchParams.get('level') as JlptLevel | null;
  const category = searchParams.get('category') as GrammarCategory | null;
  const source = searchParams.get('source') ?? 'db'; // 'db' | 'seed'

  // During development: fall back to seed JSON if no DB
  if (source === 'seed') {
    let points = grammarData as GrammarPoint[];
    if (level) points = points.filter((p) => p.jlpt_level === level);
    if (category) points = points.filter((p) => p.category === category);
    return NextResponse.json({ data: points });
  }

  const supabase = await createClient();

  let query = supabase
    .from('grammar_points')
    .select('*, grammar_exercises(*)')
    .order('sort_order');

  if (level) query = query.eq('jlpt_level', level);
  if (category) query = query.eq('category', category);

  const { data, error } = await query;
  if (error) {
    // Fallback to seed data if DB not yet migrated
    let points = grammarData as GrammarPoint[];
    if (level) points = points.filter((p) => p.jlpt_level === level);
    if (category) points = points.filter((p) => p.category === category);
    return NextResponse.json({ data: points });
  }

  return NextResponse.json({ data });
}
