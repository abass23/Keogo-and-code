#!/usr/bin/env node
/**
 * Validates grammar seed JSON files against the expected schema.
 * Used by the grammar-seeder agent after generating N3/N2 data.
 * Usage: node scripts/validate-grammar-seed.js [path/to/file.json]
 */

const fs = require('fs');
const path = require('path');

const REQUIRED_FIELDS = ['id', 'pattern', 'meaning_en', 'meaning_fr', 'jlpt_level', 'category', 'formation', 'explanation_en', 'explanation_fr', 'common_mistakes', 'exercises'];
const VALID_LEVELS = ['N5', 'N4', 'N3', 'N2'];
const VALID_EXERCISE_TYPES = ['fill_blank', 'mcq', 'conjugation', 'sentence_builder', 'error_spotter', 'context_match', 'transform'];
const VALID_DOMAINS = ['embedded', 'business', 'automotive', 'daily'];

let errors = 0;
let warnings = 0;

function err(grammarId, msg) {
  console.error(`  ✗ [${grammarId}] ${msg}`);
  errors++;
}

function warn(grammarId, msg) {
  console.warn(`  ⚠ [${grammarId}] ${msg}`);
  warnings++;
}

function validateEntry(entry, index) {
  const id = entry.id ?? `#${index}`;

  // Required fields
  for (const field of REQUIRED_FIELDS) {
    if (entry[field] === undefined || entry[field] === null) {
      err(id, `Missing required field: ${field}`);
    }
  }

  // JLPT level
  if (entry.jlpt_level && !VALID_LEVELS.includes(entry.jlpt_level)) {
    err(id, `Invalid jlpt_level: "${entry.jlpt_level}" (must be one of ${VALID_LEVELS.join(', ')})`);
  }

  // Formation
  if (Array.isArray(entry.formation) && entry.formation.length === 0) {
    warn(id, 'formation array is empty');
  }

  // Exercises
  if (Array.isArray(entry.exercises)) {
    if (entry.exercises.length < 3) {
      warn(id, `Only ${entry.exercises.length} exercise(s) — recommend at least 5`);
    }

    const exerciseDomains = new Set();
    const exerciseIds = new Set();

    for (const ex of entry.exercises) {
      // Duplicate exercise IDs
      if (ex.id) {
        if (exerciseIds.has(ex.id)) err(id, `Duplicate exercise id: ${ex.id}`);
        exerciseIds.add(ex.id);
      } else {
        warn(id, 'Exercise missing id field');
      }

      // Valid type
      if (ex.type && !VALID_EXERCISE_TYPES.includes(ex.type)) {
        err(id, `Invalid exercise type: "${ex.type}"`);
      }

      // Answers array
      if (!Array.isArray(ex.answers) || ex.answers.length === 0) {
        err(id, `Exercise ${ex.id ?? '?'} has no answers`);
      }

      // Domain coverage
      if (ex.domain) {
        if (!VALID_DOMAINS.includes(ex.domain)) {
          warn(id, `Exercise ${ex.id ?? '?'} has unknown domain: "${ex.domain}"`);
        }
        exerciseDomains.add(ex.domain);
      }

      // MCQ: exactly 1 correct answer
      if (ex.type === 'mcq' && ex.question?.options) {
        const correct = ex.question.options.filter((o) => o.is_correct);
        if (correct.length !== 1) {
          err(id, `Exercise ${ex.id ?? '?'} (mcq) must have exactly 1 correct option, found ${correct.length}`);
        }
        if (ex.question.options.length < 3) {
          warn(id, `Exercise ${ex.id ?? '?'} (mcq) has only ${ex.question.options.length} options`);
        }
      }
    }

    // Domain coverage check
    const missingDomains = VALID_DOMAINS.filter((d) => !exerciseDomains.has(d));
    if (missingDomains.length > 2) {
      warn(id, `Missing exercises for domains: ${missingDomains.join(', ')}`);
    }
  }

  // Common mistakes
  if (Array.isArray(entry.common_mistakes)) {
    for (const m of entry.common_mistakes) {
      if (!m.wrong || !m.correct) {
        err(id, 'common_mistakes entry missing wrong/correct fields');
      }
    }
  }
}

// Resolve file path(s)
const args = process.argv.slice(2);
const dataDir = path.join(__dirname, '..', 'data');
const files = args.length > 0
  ? args.map((f) => path.resolve(f))
  : fs.readdirSync(dataDir)
      .filter((f) => f.match(/^grammar-n[2-5]/))
      .map((f) => path.join(dataDir, f));

if (files.length === 0) {
  console.log('No grammar seed files found.');
  process.exit(0);
}

let totalEntries = 0;

for (const filePath of files) {
  console.log(`\nValidating ${path.basename(filePath)}...`);
  let data;
  try {
    data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`  ✗ Failed to parse JSON: ${e.message}`);
    errors++;
    continue;
  }

  if (!Array.isArray(data)) {
    console.error(`  ✗ Root must be an array`);
    errors++;
    continue;
  }

  // Duplicate top-level IDs
  const ids = data.map((e) => e.id).filter(Boolean);
  const dupes = ids.filter((id, i) => ids.indexOf(id) !== i);
  if (dupes.length > 0) {
    console.error(`  ✗ Duplicate entry IDs: ${[...new Set(dupes)].join(', ')}`);
    errors += dupes.length;
  }

  data.forEach((entry, i) => validateEntry(entry, i));
  totalEntries += data.length;
  console.log(`  ${data.length} entries checked`);
}

console.log(`\n── Summary ─────────────────────────────`);
console.log(`  Files:    ${files.length}`);
console.log(`  Entries:  ${totalEntries}`);
console.log(`  Errors:   ${errors}`);
console.log(`  Warnings: ${warnings}`);
console.log(`────────────────────────────────────────`);

if (errors > 0) {
  console.error(`\n✗ Validation FAILED with ${errors} error(s)`);
  process.exit(1);
} else {
  console.log(`\n✓ Validation passed${warnings > 0 ? ` (${warnings} warning(s))` : ''}`);
  process.exit(0);
}
