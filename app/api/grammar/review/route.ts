import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { gradeGrammarPoint, createInitialGrammarSRS } from '@/lib/grammar-srs';
import type { GrammarReviewPayload, GrammarSRSState } from '@/lib/grammar-types';

/**
 * POST /api/grammar/review
 * Submit a grammar exercise result and update the SRS state.
 * Body: GrammarReviewPayload
 */
export async function POST(req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body: GrammarReviewPayload = await req.json();
  const { grammar_point_id, exercise_type, is_correct, attempts, used_hint, is_cram } = body;

  if (!grammar_point_id || !exercise_type) {
    return NextResponse.json({ error: 'grammar_point_id and exercise_type are required' }, { status: 400 });
  }

  // Fetch or create user_grammar record
  const { data: existing } = await supabase
    .from('user_grammar')
    .select('*')
    .eq('user_id', user.id)
    .eq('grammar_point_id', grammar_point_id)
    .single();

  const currentSRS: GrammarSRSState = existing
    ? {
        interval: existing.interval,
        repetitions: existing.repetitions,
        easeFactor: existing.ease_factor,
        nextReview: existing.next_review,
        lastReview: existing.last_review,
        total_reviews: existing.total_reviews,
        correct_count: existing.correct_count,
        is_learned: existing.is_learned,
        is_ghost: existing.is_ghost,
        type_accuracy: existing.type_accuracy,
        weakest_type: existing.weakest_type,
      }
    : createInitialGrammarSRS();

  const { next, xp } = gradeGrammarPoint(currentSRS, {
    type: exercise_type,
    attempts,
    used_hint,
    is_cram,
  });

  if (!is_cram) {
    const upsertData = {
      user_id: user.id,
      grammar_point_id,
      interval: next.interval,
      repetitions: next.repetitions,
      ease_factor: next.easeFactor,
      next_review: next.nextReview,
      last_review: next.lastReview,
      total_reviews: next.total_reviews,
      correct_count: next.correct_count,
      is_learned: next.is_learned,
      is_ghost: next.is_ghost,
      type_accuracy: next.type_accuracy,
      weakest_type: next.weakest_type,
      updated_at: new Date().toISOString(),
    };

    const { error: upsertError } = await supabase
      .from('user_grammar')
      .upsert(upsertData, { onConflict: 'user_id,grammar_point_id' });

    if (upsertError) {
      return NextResponse.json({ error: upsertError.message }, { status: 500 });
    }
  }

  return NextResponse.json({
    srs: next,
    xp_earned: xp,
    is_correct,
    is_learned: next.is_learned,
    is_ghost: next.is_ghost,
    weakest_type: next.weakest_type,
  });
}
