/**
 * sentiment_engine.js — High-Accuracy News & Financial PR Sentiment Engine
 *
 * Tailored specifically for media intelligence, news headlines, and business journalism.
 * Features:
 *  - 3x weighting for headlines (titles carry primary sentiment in news journalism)
 *  - Financial & corporate vocabulary (earnings, lawsuits, product launches, market moves)
 *  - Negation detection ('not good', 'no growth', 'failed to deliver')
 *  - Intensifier scaling ('massive surge', 'sharp decline')
 *  - Strict tri-state classification: 'Positive' | 'Neutral' | 'Negative'
 */

'use strict';

// ── Polarity Lexicon ──────────────────────────────────────────────────────────

const POSITIVE_LEXICON = {
  // Strong (+3)
  'surge': 3, 'surges': 3, 'surged': 3, 'surging': 3,
  'skyrocket': 3, 'skyrockets': 3, 'skyrocketed': 3, 'skyrocketing': 3,
  'breakthrough': 3, 'breakthroughs': 3,
  'outperform': 3, 'outperforms': 3, 'outperformed': 3, 'outperforming': 3,
  'soar': 3, 'soars': 3, 'soared': 3, 'soaring': 3,
  'record': 2.5, 'all-time-high': 3, 'blockbuster': 3, 'triumph': 3, 'triumphant': 3,
  'revolutionary': 3, 'stellar': 3, 'milestone': 2.5, 'masterpiece': 3,

  // Moderate (+2)
  'profit': 2, 'profits': 2, 'profitable': 2, 'profitability': 2,
  'gain': 2, 'gains': 2, 'gained': 2, 'gaining': 2,
  'beat': 2, 'beats': 2, 'beating': 2,
  'win': 2, 'wins': 2, 'won': 2, 'winning': 2, 'winner': 2,
  'rally': 2, 'rallies': 2, 'rallied': 2, 'rallying': 2,
  'boom': 2, 'booming': 2, 'boomed': 2,
  'leap': 2, 'leaps': 2, 'leaped': 2,
  'exceed': 2, 'exceeds': 2, 'exceeded': 2, 'exceeding': 2,
  'dominate': 2, 'dominates': 2, 'dominated': 2, 'dominance': 2, 'dominant': 2,
  'award': 2, 'awards': 2, 'awarded': 2, 'awarding': 2,
  'bullish': 2, 'upgrade': 2, 'upgrades': 2, 'upgraded': 2, 'upgrading': 2,
  'boost': 2, 'boosts': 2, 'boosted': 2, 'boosting': 2,
  'innovative': 2, 'innovation': 2, 'innovations': 2,
  'success': 2, 'successful': 2, 'successfully': 2,
  'partner': 1.8, 'partners': 1.8, 'partnered': 1.8, 'partnership': 2, 'partnerships': 2,
  'expansion': 2, 'expand': 1.8, 'expands': 1.8, 'expanded': 1.8, 'expanding': 1.8,
  'dividend': 2, 'dividends': 2,

  // Mild (+1)
  'growth': 1.5, 'grows': 1.5, 'grew': 1.5, 'growing': 1.5,
  'launch': 1.5, 'launches': 1.5, 'launched': 1.5, 'launching': 1.5,
  'unveil': 1.5, 'unveils': 1.5, 'unveiled': 1.5, 'unveiling': 1.5,
  'introduce': 1.2, 'introduces': 1.2, 'introduced': 1.2,
  'lead': 1.2, 'leads': 1.2, 'leading': 1.5, 'leader': 1.5, 'leadership': 1.5,
  'rise': 1.2, 'rises': 1.2, 'rose': 1.2, 'rising': 1.2,
  'jump': 1.2, 'jumps': 1.2, 'jumped': 1.2,
  'climb': 1.2, 'climbs': 1.2, 'climbed': 1.2,
  'invest': 1.2, 'invests': 1.2, 'invested': 1.2, 'investment': 1.5, 'investments': 1.5,
  'secure': 1.2, 'secures': 1.2, 'secured': 1.2,
  'approve': 1.2, 'approves': 1.2, 'approved': 1.5, 'approval': 1.5,
  'collaborate': 1.2, 'collaborates': 1.2, 'collaboration': 1.5,
  'advance': 1.2, 'advances': 1.2, 'advanced': 1.2, 'advancement': 1.5,
  'celebrate': 1.2, 'celebrates': 1.2, 'celebrated': 1.2,
  'confident': 1.2, 'confidence': 1.2, 'positive': 1.2, 'optimistic': 1.5,
  'strong': 1.2, 'stronger': 1.2, 'strengthen': 1.2, 'strengthens': 1.2,
  'improve': 1.2, 'improves': 1.2, 'improved': 1.2, 'improvement': 1.5,
  'deal': 1.0, 'deals': 1.0, 'agreement': 1.2, 'agreements': 1.2,
  'revenue': 1.0, 'hiring': 1.0, 'hire': 1.0, 'hires': 1.0,
};

const NEGATIVE_LEXICON = {
  // Strong (-3)
  'crash': -3, 'crashes': -3, 'crashed': -3, 'crashing': -3,
  'plunge': -3, 'plunges': -3, 'plunged': -3, 'plunging': -3,
  'collapse': -3, 'collapses': -3, 'collapsed': -3, 'collapsing': -3,
  'scandal': -3, 'scandals': -3, 'scandalous': -3,
  'fraud': -3, 'fraudulent': -3,
  'lawsuit': -3, 'lawsuits': -3, 'sued': -3, 'sues': -3, 'suing': -3,
  'bankrupt': -3, 'bankruptcy': -3,
  'antitrust': -3, 'indictment': -3, 'indicted': -3,
  'catastrophe': -3, 'catastrophic': -3, 'disaster': -3, 'disastrous': -3,
  'breach': -2.8, 'breaches': -2.8, 'breached': -2.8,
  'hack': -2.8, 'hacks': -2.8, 'hacked': -2.8, 'hacking': -2.8, 'hacker': -2.8,
  'scam': -3, 'scams': -3, 'scammed': -3,

  // Moderate (-2)
  'layoff': -2.2, 'layoffs': -2.2, 'laid off': -2.5,
  'fire': -2, 'fires': -2, 'fired': -2, 'firing': -2,
  'resign': -2, 'resigns': -2, 'resigned': -2, 'resignation': -2,
  'slump': -2, 'slumps': -2, 'slumped': -2, 'slumping': -2,
  'tank': -2, 'tanks': -2, 'tanked': -2, 'tanking': -2,
  'dive': -2, 'dives': -2, 'dived': -2, 'diving': -2,
  'drop': -1.8, 'drops': -1.8, 'dropped': -1.8, 'dropping': -1.8,
  'fall': -1.8, 'falls': -1.8, 'fell': -1.8, 'falling': -1.8,
  'decline': -1.8, 'declines': -1.8, 'declined': -1.8, 'declining': -1.8,
  'loss': -2, 'losses': -2, 'lost': -1.8,
  'fail': -2, 'fails': -2, 'failed': -2, 'failure': -2.2, 'failing': -2,
  'penalty': -2, 'penalties': -2, 'fine': -1.8, 'fined': -2, 'fines': -1.8,
  'ban': -2, 'bans': -2, 'banned': -2, 'banning': -2,
  'probe': -1.8, 'probes': -1.8, 'probed': -1.8, 'probing': -1.8,
  'investigation': -1.8, 'investigations': -1.8, 'investigated': -1.8,
  'crisis': -2.2, 'crises': -2.2,
  'corruption': -2.5, 'corrupt': -2.5,
  'violation': -2, 'violations': -2, 'violated': -2,
  'controversy': -2, 'controversies': -2, 'controversial': -1.8,
  'misconduct': -2.2, 'outage': -2, 'outages': -2,
  'recall': -2, 'recalls': -2, 'recalled': -2,

  // Mild (-1)
  'warn': -1.5, 'warns': -1.5, 'warned': -1.5, 'warning': -1.5, 'warnings': -1.5,
  'risk': -1.2, 'risks': -1.2, 'risky': -1.2,
  'trouble': -1.5, 'troubles': -1.5, 'troubled': -1.5,
  'problem': -1.2, 'problems': -1.2,
  'cut': -1.5, 'cuts': -1.5, 'cutting': -1.5,
  'delay': -1.2, 'delays': -1.2, 'delayed': -1.2, 'delaying': -1.2,
  'cancel': -1.5, 'cancels': -1.5, 'cancelled': -1.5, 'canceled': -1.5, 'cancellation': -1.5,
  'miss': -1.5, 'misses': -1.5, 'missed': -1.5, 'missing': -1.2,
  'disappoint': -1.8, 'disappoints': -1.8, 'disappointed': -1.8, 'disappointing': -1.8,
  'hurt': -1.5, 'hurts': -1.5, 'hurting': -1.5,
  'threat': -1.5, 'threats': -1.5, 'threaten': -1.5, 'threatens': -1.5, 'threatened': -1.5,
  'criticize': -1.5, 'criticizes': -1.5, 'criticized': -1.5, 'criticism': -1.5,
  'accuse': -1.5, 'accuses': -1.5, 'accused': -1.5, 'accusation': -1.5,
  'struggle': -1.5, 'struggles': -1.5, 'struggled': -1.5, 'struggling': -1.5,
  'underperform': -1.8, 'underperforms': -1.8, 'underperformed': -1.8,
  'bearish': -1.5, 'downgrade': -1.8, 'downgrades': -1.8, 'downgraded': -1.8,
  'strike': -1.5, 'strikes': -1.5, 'dispute': -1.2, 'disputes': -1.2,
  'leak': -1.5, 'leaks': -1.5, 'leaked': -1.5, 'leaking': -1.5,
  'bug': -1.0, 'bugs': -1.0, 'glitch': -1.2, 'glitches': -1.2,
  'deficit': -1.5, 'debt': -1.0, 'debt-laden': -1.8,
};

const NEGATIONS = new Set([
  'not', "don't", 'dont', "didn't", 'didnt', "doesn't", 'doesnt', "won't", 'wont',
  'never', 'no', 'none', 'neither', 'nor', 'hardly', 'barely', 'scarcely',
  'unable', 'failed', 'fails', 'failing', 'without', 'lack', 'lacks', 'lacking'
]);

const INTENSIFIERS = {
  'massive': 1.5, 'massively': 1.5, 'huge': 1.4, 'hugely': 1.4,
  'sharp': 1.4, 'sharply': 1.4, 'significant': 1.3, 'significantly': 1.3,
  'major': 1.3, 'heavy': 1.3, 'heavily': 1.3, 'steep': 1.4, 'steeply': 1.4,
  'record': 1.4, 'strong': 1.2, 'strongly': 1.2, 'historic': 1.5,
};

// ── Text Tokenizer & Scorer ──────────────────────────────────────────────────

function tokenize(text) {
  if (!text) return [];
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * Score a sequence of tokens with negation and intensifier lookback.
 */
function scoreTokens(tokens) {
  let score = 0;
  let matches = 0;

  for (let i = 0; i < tokens.length; i++) {
    const word = tokens[i];
    let wordScore = 0;

    if (POSITIVE_LEXICON[word]) {
      wordScore = POSITIVE_LEXICON[word];
    } else if (NEGATIVE_LEXICON[word]) {
      wordScore = NEGATIVE_LEXICON[word];
    }

    if (wordScore !== 0) {
      // Check for 1-3 token lookback negation
      let isNegated = false;
      for (let j = Math.max(0, i - 3); j < i; j++) {
        if (NEGATIONS.has(tokens[j])) {
          isNegated = true;
          break;
        }
      }

      // Check for 1-2 token lookback intensifier
      let multiplier = 1.0;
      for (let j = Math.max(0, i - 2); j < i; j++) {
        if (INTENSIFIERS[tokens[j]]) {
          multiplier = Math.max(multiplier, INTENSIFIERS[tokens[j]]);
        }
      }

      if (isNegated) {
        // Flipping polarity with dampening
        wordScore = wordScore > 0 ? -(wordScore * 0.8) : (Math.abs(wordScore) * 0.5);
      }

      score += wordScore * multiplier;
      matches++;
    }
  }

  return { score, matches };
}

// ── Main Analysis Function ───────────────────────────────────────────────────

/**
 * Analyzes article headline and content to compute accurate sentiment.
 *
 * @param {string} title - Article headline (weighted 3x)
 * @param {string} [summary=''] - Article snippet or summary
 * @param {string} [fullBody=''] - Optional body text (first 1000 chars used)
 * @returns {'Positive' | 'Neutral' | 'Negative'} Normalized sentiment category
 */
function analyzeSentiment(title, summary = '', fullBody = '') {
  const titleTokens = tokenize(title);
  const bodyText = [summary || '', (fullBody || '').slice(0, 1000)].join(' ');
  const bodyTokens = tokenize(bodyText);

  const titleResult = scoreTokens(titleTokens);
  const bodyResult  = scoreTokens(bodyTokens);

  // Headline has 3.0x weight because news headlines directly capture the core editorial tone
  const compositeScore = (titleResult.score * 3.0) + (bodyResult.score * 1.0);

  if (compositeScore >= 0.75) {
    return 'Positive';
  } else if (compositeScore <= -0.75) {
    return 'Negative';
  } else {
    return 'Neutral';
  }
}

/**
 * Detailed analysis with raw score, confidence, and matched keywords.
 */
function analyzeDetailed(title, summary = '', fullBody = '') {
  const titleTokens = tokenize(title);
  const bodyTokens  = tokenize([summary || '', (fullBody || '').slice(0, 1000)].join(' '));

  const titleResult = scoreTokens(titleTokens);
  const bodyResult  = scoreTokens(bodyTokens);
  const compositeScore = (titleResult.score * 3.0) + (bodyResult.score * 1.0);

  let category = 'Neutral';
  if (compositeScore >= 0.75) category = 'Positive';
  else if (compositeScore <= -0.75) category = 'Negative';

  return {
    sentiment: category,
    score: parseFloat(compositeScore.toFixed(2)),
    headlineMatches: titleResult.matches,
    bodyMatches: bodyResult.matches,
  };
}

module.exports = {
  analyzeSentiment,
  analyzeDetailed,
};
