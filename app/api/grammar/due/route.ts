import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

/**
 * GET /api/grammar/due
 * Returns grammar points due for SRS review + new items.
 * Query params:
 *   limit  — max items to return (default 20)
 *   mode   — 'review' (due only) | 'learn' (new only) | 'both' (default)
 */
export async function GET(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const limit = Number(searchParams.get('limit') ?? 20);
  const mode = searchParams.get('mode') ?? 'both';

  const now = new Date().toISOString();

  // Fetch user's grammar SRS records joined with grammar_points
  const { data: userGrammar, error } = await supabase
    .from('user_grammar')
    .select('*, grammar_points(*, grammar_exercises(*))')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  const dueItems = (userGrammar ?? []).filter((ug) => {
    if (mode === 'learn') return false;
    return ug.is_learned && new Date(ug.next_review) <= new Date(now);
  });

  // Ghost items always come first
  const ghosts = dueItems.filter((ug) => ug.is_ghost);
  const regular = dueItems.filter((ug) => !ug.is_ghost);

  const result = [...ghosts, ...regular].slice(0, limit);

  return NextResponse.json({
    data: result,
    due_count: dueItems.length,
    ghost_count: ghosts.length,
  });
}
