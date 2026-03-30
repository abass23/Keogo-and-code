import type { Locale } from '../types';

type TranslationMap = Record<string, { en: string; fr: string }>;

export const strings: TranslationMap = {
  // Nav
  'nav.home': { en: 'Home', fr: 'Accueil' },
  'nav.flashcards': { en: 'Flashcards', fr: 'Fiches' },
  'nav.kanji': { en: 'Kanji', fr: 'Kanji' },
  'nav.simulator': { en: 'Simulator', fr: 'Simulateur' },
  'nav.progress': { en: 'Progress', fr: 'Progrès' },
  'nav.settings': { en: 'Settings', fr: 'Paramètres' },

  // Dashboard
  'dashboard.greeting': { en: 'Good morning!', fr: 'Bonjour !' },
  'dashboard.due': { en: 'Due for review', fr: 'À réviser' },
  'dashboard.streak': { en: 'Day streak', fr: 'Jours consécutifs' },
  'dashboard.xp': { en: 'XP today', fr: 'XP aujourd\'hui' },
  'dashboard.start_review': { en: 'Start Review', fr: 'Commencer la révision' },
  'dashboard.days_until_jlpt': { en: 'days until JLPT', fr: 'jours avant le JLPT' },

  // Flashcard
  'card.tap_to_reveal': { en: 'Tap to reveal', fr: 'Appuyer pour révéler' },
  'card.again': { en: 'Again', fr: 'Encore' },
  'card.hard': { en: 'Hard', fr: 'Difficile' },
  'card.good': { en: 'Good', fr: 'Bien' },
  'card.easy': { en: 'Easy', fr: 'Facile' },
  'card.example': { en: 'Example', fr: 'Exemple' },
  'card.new': { en: 'New', fr: 'Nouveau' },

  // Session
  'session.complete': { en: 'Session complete!', fr: 'Session terminée !' },
  'session.correct': { en: 'Correct', fr: 'Correct' },
  'session.xp_earned': { en: 'XP earned', fr: 'XP gagnés' },
  'session.continue': { en: 'Continue', fr: 'Continuer' },
  'session.no_due': { en: 'No cards due — come back later!', fr: 'Aucune carte à réviser pour l\'instant !' },

  // Deck selector
  'deck.all': { en: 'All cards', fr: 'Toutes les cartes' },
  'deck.n5': { en: 'N5 Core', fr: 'N5 Fondamentaux' },
  'deck.n4': { en: 'N4 Core', fr: 'N4 Fondamentaux' },
  'deck.n3': { en: 'N3 Core', fr: 'N3 Fondamentaux' },
  'deck.embedded': { en: 'Embedded Systems', fr: 'Systèmes embarqués' },
  'deck.automotive': { en: 'Automotive', fr: 'Automobile' },
  'deck.business': { en: 'Business Keigo', fr: 'Keigo professionnel' },

  // Kanji
  'kanji.stroke_order': { en: 'Stroke order', fr: 'Ordre des traits' },
  'kanji.readings': { en: 'Readings', fr: 'Lectures' },
  'kanji.onyomi': { en: 'On\'yomi', fr: 'On\'yomi' },
  'kanji.kunyomi': { en: 'Kun\'yomi', fr: 'Kun\'yomi' },
  'kanji.examples': { en: 'Example words', fr: 'Mots exemples' },
  'kanji.meaning': { en: 'Meaning', fr: 'Signification' },

  // Simulator
  'sim.jikoshoukai': { en: 'Self-introduction', fr: 'Auto-présentation' },
  'sim.interview': { en: 'Interview Simulator', fr: 'Simulateur d\'entretien' },
  'sim.daily': { en: 'Daily Conversation', fr: 'Conversation quotidienne' },
  'sim.technical': { en: 'Technical Discussion', fr: 'Discussion technique' },
  'sim.start': { en: 'Start', fr: 'Commencer' },
  'sim.send': { en: 'Send', fr: 'Envoyer' },
  'sim.listening': { en: 'Listening...', fr: 'Écoute...' },

  // Settings
  'settings.language': { en: 'Interface language', fr: 'Langue de l\'interface' },
  'settings.furigana': { en: 'Show furigana', fr: 'Afficher les furigana' },
  'settings.daily_goal': { en: 'Daily card goal', fr: 'Objectif quotidien' },
  'settings.notifications': { en: 'Review reminders', fr: 'Rappels de révision' },

  // Grammar Dojo
  'nav.grammar': { en: 'Grammar', fr: 'Grammaire' },
  'grammar.dojo': { en: 'Grammar Dojo', fr: 'Dojo de grammaire' },
  'grammar.review': { en: 'SRS Review', fr: 'Révision SRS' },
  'grammar.learn': { en: 'Learn New', fr: 'Apprendre' },
  'grammar.cram': { en: 'Cram Mode', fr: 'Mode révision rapide' },
  'grammar.fill_blank': { en: 'Fill in the blank', fr: 'Compléter la phrase' },
  'grammar.mcq': { en: 'Multiple Choice', fr: 'Choix multiple' },
  'grammar.conjugation': { en: 'Conjugation', fr: 'Conjugaison' },
  'grammar.builder': { en: 'Sentence Builder', fr: 'Construire la phrase' },
  'grammar.error': { en: 'Error Spotter', fr: 'Trouver l\'erreur' },
  'grammar.context': { en: 'Context Match', fr: 'Niveau de politesse' },
  'grammar.transform': { en: 'Sentence Transform', fr: 'Transformer la phrase' },
  'grammar.ghost': { en: 'Ghost grammar detected', fr: 'Grammaire fantôme détectée' },
  'grammar.learned': { en: 'Learned!', fr: 'Maîtrisé !' },
  'grammar.attempt': { en: 'Attempt', fr: 'Tentative' },
  'grammar.hint': { en: 'Hint', fr: 'Indice' },
  'grammar.check': { en: 'Check', fr: 'Vérifier' },
  'grammar.correct': { en: 'Correct!', fr: 'Correct !' },
  'grammar.perfect': { en: 'Perfect!', fr: 'Parfait !' },
  'grammar.wrong': { en: 'Not quite...', fr: 'Pas tout à fait...' },
  'grammar.continue': { en: 'Continue', fr: 'Continuer' },
  'grammar.points_due': { en: 'grammar points due', fr: 'points de grammaire à réviser' },

  // Auth
  'auth.login': { en: 'Sign in', fr: 'Se connecter' },
  'auth.logout': { en: 'Sign out', fr: 'Se déconnecter' },
  'auth.email': { en: 'Email address', fr: 'Adresse e-mail' },
  'auth.magic_link': { en: 'Send magic link', fr: 'Envoyer le lien magique' },
  'auth.check_email': { en: 'Check your email for the login link.', fr: 'Vérifiez votre e-mail pour le lien de connexion.' },
};

export function t(key: string, locale: Locale): string {
  return strings[key]?.[locale] ?? strings[key]?.en ?? key;
}
