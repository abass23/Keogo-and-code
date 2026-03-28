import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import grammarData from '@/data/grammar-n5-n4.json';
import type { GrammarPoint, GrammarExercise, ExerciseType } from '@/lib/grammar-types';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const grammarPointId = searchParams.get('grammarPointId');
  const type = searchParams.get('type') as ExerciseType | null;
  const domain = searchParams.get('domain');

  if (!grammarPointId) {
    return NextResponse.json({ error: 'grammarPointId is required' }, { status: 400 });
  }

  const supabase = await createClient();

  let query = supabase
    .from('grammar_exercises')
    .select('*')
    .eq('grammar_point_id', grammarPointId);

  if (type) query = query.eq('type', type);
  if (domain) query = query.eq('domain', domain);

  const { data, error } = await query;

  if (error || !data?.length) {
    // Fallback to seed data
    const point = (grammarData as GrammarPoint[]).find((p) => p.id === grammarPointId);
    if (!point?.exercises) {
      return NextResponse.json({ data: [] });
    }
    let exercises: GrammarExercise[] = point.exercises;
    if (type) exercises = exercises.filter((e) => e.type === type);
    if (domain) exercises = exercises.filter((e) => e.domain === domain);
    return NextResponse.json({ data: exercises });
  }

  return NextResponse.json({ data });
}
