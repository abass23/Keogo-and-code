import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import type { GrammarStats, TypeAccuracy, JlptLevel } from '@/lib/grammar-types';

/**
 * GET /api/grammar/stats
 * Returns grammar learning statistics for the current user.
 */
export async function GET(_req: NextRequest) {
  const supabase = await createClient();

  const { data: { user }, error: authError } = await supabase.auth.getUser();
  if (authError || !user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // All user grammar records
  const { data: records, error } = await supabase
    .from('user_grammar')
    .select('*, grammar_points(jlpt_level, pattern)')
    .eq('user_id', user.id);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Total grammar points by level (from grammar_points table)
  const { data: allPoints } = await supabase
    .from('grammar_points')
    .select('id, jlpt_level');

  const totalByLevel: Record<JlptLevel, number> = { N5: 0, N4: 0, N3: 0, N2: 0 };
  for (const p of allPoints ?? []) {
    totalByLevel[p.jlpt_level as JlptLevel] = (totalByLevel[p.jlpt_level as JlptLevel] ?? 0) + 1;
  }

  const now = new Date();
  const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  let learned_count = 0;
  let review_due = 0;
  let ghost_count = 0;
  const by_level: Record<JlptLevel, { learned: number; total: number }> = {
    N5: { learned: 0, total: totalByLevel.N5 },
    N4: { learned: 0, total: totalByLevel.N4 },
    N3: { learned: 0, total: totalByLevel.N3 },
    N2: { learned: 0, total: totalByLevel.N2 },
  };

  // Aggregate type accuracy across all grammar points
  const aggregateAccuracy: TypeAccuracy = {
    fill_blank: { correct: 0, total: 0 },
    sentence_builder: { correct: 0, total: 0 },
    error_spotter: { correct: 0, total: 0 },
    mcq: { correct: 0, total: 0 },
    conjugation: { correct: 0, total: 0 },
    context_match: { correct: 0, total: 0 },
    transform: { correct: 0, total: 0 },
  };

  const weeklyReviewed: string[] = [];
  const weeklyLearned: string[] = [];
  const struggledPatterns: string[] = [];
  const masteredPatterns: string[] = [];

  for (const rec of records ?? []) {
    const level = rec.grammar_points?.jlpt_level as JlptLevel;
    const pattern = rec.grammar_points?.pattern ?? '';

    if (rec.is_learned) {
      learned_count++;
      if (level) by_level[level].learned++;
    }
    if (rec.is_ghost) ghost_count++;
    if (rec.is_learned && new Date(rec.next_review) <= now) review_due++;

    // Weekly stats
    if (rec.last_review && new Date(rec.last_review) >= oneWeekAgo) {
      weeklyReviewed.push(rec.grammar_point_id);
    }
    if (rec.is_learned && rec.last_review && new Date(rec.last_review) >= oneWeekAgo) {
      weeklyLearned.push(rec.grammar_point_id);
    }

    // Accuracy aggregation
    if (rec.type_accuracy) {
      for (const type of Object.keys(aggregateAccuracy) as (keyof TypeAccuracy)[]) {
        const entry = rec.type_accuracy[type];
        if (entry) {
          aggregateAccuracy[type].correct += entry.correct ?? 0;
          aggregateAccuracy[type].total += entry.total ?? 0;
        }
      }
    }

    // Identify struggled/mastered
    const accuracy = rec.total_reviews > 0 ? rec.correct_count / rec.total_reviews : 0;
    if (rec.total_reviews >= 5) {
      if (accuracy < 0.6) struggledPatterns.push(pattern);
      else if (accuracy >= 0.9) masteredPatterns.push(pattern);
    }
  }

  // Find weakest type
  let weakest_type = null;
  let worstRate = Infinity;
  for (const [type, entry] of Object.entries(aggregateAccuracy)) {
    if (entry.total >= 3) {
      const rate = entry.correct / entry.total;
      if (rate < worstRate) {
        worstRate = rate;
        weakest_type = type;
      }
    }
  }

  const weeklyCorrect = (records ?? [])
    .filter((r) => r.last_review && new Date(r.last_review) >= oneWeekAgo)
    .reduce((sum, r) => sum + (r.correct_count ?? 0), 0);
  const weeklyTotal = weeklyReviewed.length;

  const stats: GrammarStats = {
    learned_count,
    review_due,
    ghost_count,
    by_level,
    type_accuracy: aggregateAccuracy,
    weakest_type: weakest_type as GrammarStats['weakest_type'],
    weekly_report: {
      new_learned: weeklyLearned.length,
      total_reviewed: weeklyTotal,
      accuracy_pct: weeklyTotal > 0 ? Math.round((weeklyCorrect / weeklyTotal) * 100) : 0,
      struggled_patterns: struggledPatterns.slice(0, 5),
      mastered_patterns: masteredPatterns.slice(0, 5),
    },
  };

  return NextResponse.json({ data: stats });
}
