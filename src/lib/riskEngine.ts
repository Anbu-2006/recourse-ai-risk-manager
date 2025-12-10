import { Groq } from 'groq-sdk';
import { createGroqChatCompletion } from './groqClient';
import { getDb, MandateRow } from './db';

// Pass 1: Injection Regex Patterns (<2ms)
const INJECTION_PATTERNS = [
  { pattern: /ignore\s+(previous|above)\s+(instructions|limits|rules)/i, name: 'Instruction Override' },
  { pattern: /system\s*:\s*override/i, name: 'System Role Hijack' },
  { pattern: /approve\s+(transfer|payment)\s+of\s+₹?\d+/i, name: 'Forced Approval Injection' },
  { pattern: /[\u200B-\u200D\uFEFF\u202E]/, name: 'Zero-Width Character Obfuscation' },
  { pattern: /jailbreak|developer\s+mode|unrestricted\s+api/i, name: 'Jailbreak Signature' },
  { pattern: /bypass\s+(gate|limit|mandate|cap)/i, name: 'Gate Bypass Attempt' },
];

export interface Pass1Result {
  passed: boolean;
  action: 'PROCEED' | 'REJECT';
  reason?: string;
  failureReason?: string;
  matchedPattern?: string;
  latencyMs: number;
}

/**
 * Pass 1: Sub-2ms Regex/AST Prompt Injection Sanitizer
 */
export function evaluatePass1(input: string): Pass1Result {
  const startTime = performance.now();

  for (const { pattern, name } of INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      const latencyMs = Number((performance.now() - startTime).toFixed(2));
      return {
        passed: false,
        action: 'REJECT',
        reason: 'Adversarial Prompt Injection Intercepted',
        failureReason: 'ADVERSARIAL_PROMPT_INJECTION_DETECTED',
        matchedPattern: name,
        latencyMs,
      };
    }
  }

  const latencyMs = Number((performance.now() - startTime).toFixed(2));
  return {
    passed: true,
    action: 'PROCEED',
    latencyMs,
  };
}

export interface ADSScoreBreakdown {
  adsScore: number;
  syntaxScore: number;       // S_syntax (0.0 - 1.0)
  landmarkScore: number;     // S_landmark (0.0 - 1.0)
  geoCoherenceScore: number; // S_geo (0.0 - 1.0)
  gibberishProb: number;     // P_gibberish (0.0 - 1.0)
  riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  paymentStrategy: 'DIRECT_COD' | 'REQUIRE_SHIPPING_DEPOSIT' | 'UPI_RESERVE_HOLD';
  depositPaisa: number;
  reason: string;
}

/**
 * Pass 2: Address Deliverability Scorer (ADS)
 * ADS = 0.30 * S_syntax + 0.35 * S_landmark + 0.25 * S_geo + 0.10 * (1 - P_gibberish)
 */
export async function evaluateADS(rawAddress: string): Promise<ADSScoreBreakdown> {
  const groqKey = process.env.GROQ_API_KEY;
  const isKeyValid = groqKey && !groqKey.includes('placeholder');

  if (isKeyValid) {
    try {
      const groq = new Groq({ apiKey: groqKey });
      const prompt = `You are an expert Indian postal address deliverability analyzer.
Score the following raw address on 4 dimensions from 0.0 to 1.0:
1. syntax: presence of house/flat number, road/street, locality, city, state, 6-digit pin code
2. landmark: presence of clear anchor points (e.g., "Near", "Behind", "Opposite", temple, hospital, school, metro)
3. geo_coherence: logical consistency of pincode with state/city
4. gibberish_probability: probability of fake/test text (e.g. "asdf", "test 123", random letters)

Address to score: "${rawAddress}"

Respond strictly with a JSON object:
{
  "syntax": 0.85,
  "landmark": 0.90,
  "geo_coherence": 0.95,
  "gibberish_probability": 0.05,
  "reason": "Brief summary"
}`;

      const content = await createGroqChatCompletion({
        messages: [{ role: 'user', content: prompt }],
        response_format: { type: 'json_object' },
        temperature: 0.1,
      });

      if (content) {
        const parsed = JSON.parse(content);
        return computeADSFromComponents(
          parsed.syntax ?? 0.5,
          parsed.landmark ?? 0.5,
          parsed.geo_coherence ?? 0.5,
          parsed.gibberish_probability ?? 0.1,
          parsed.reason ?? 'LLM-evaluated deliverability score'
        );
      }
    } catch (error) {
      console.warn('Groq ADS scoring failed or timed out, using deterministic heuristics fallback:', error);
    }
  }

  // Deterministic high-precision fallback for Indian addresses
  return evaluateADSDeterministic(rawAddress);
}

/**
 * Deterministic Address Deliverability Scoring for Indian contexts
 */
export function evaluateADSDeterministic(rawAddress: string): ADSScoreBreakdown {
  const clean = rawAddress.trim().toLowerCase();
  
  // 1. Check for gibberish
  let gibberishProb = 0.02;
  if (/^(asdf|qwerty|test|fake|null|none|1234|abc)/i.test(clean) || clean.length < 14) {
    gibberishProb = 0.95;
  } else if (!/[a-z]{3,}/i.test(clean) || (clean.match(/[^a-z0-9\s,.-]/gi) || []).length > 5) {
    gibberishProb = 0.70;
  }

  // 2. Landmark Detection (Near, Behind, Opp, Temple, Metro, School, etc.)
  const landmarkKeywords = [
    'near', 'behind', 'opposite', 'opp', 'beside', 'next to', 'adjacent',
    'temple', 'mandir', 'masjid', 'church', 'hospital', 'school', 'college',
    'metro', 'station', 'chowk', 'circle', 'bypass', 'cross', 'main'
  ];
  const foundLandmarks = landmarkKeywords.filter(kw => clean.includes(kw));
  let landmarkScore = 0.35;
  if (foundLandmarks.length >= 2) landmarkScore = 0.85;
  else if (foundLandmarks.length === 1) landmarkScore = 0.65;

  // 3. Syntax Score (Structured Door/Flat Premise, PIN Code, Metro vs Rural)
  const hasPinCode = /\b[1-9][0-9]{5}\b/.test(clean);
  const hasStructuredPremise = /(flat|apartment|apt|house|door|villa|bldg|building|tower)\s*[0-9a-z#]+/i.test(clean) || /^[0-9]+[\/-][0-9a-z]+/i.test(clean);
  const hasMetroCity = /(bengaluru|bangalore|mumbai|delhi|gurugram|gurgaon|noida|hyderabad|chennai|pune|kolkata)/i.test(clean);

  let syntaxScore = 0.30;
  let geoScore = 0.40;

  if (hasStructuredPremise && hasPinCode && hasMetroCity) {
    // Fully structured tier-1 metro apartment/building address
    syntaxScore = 0.95;
    landmarkScore = Math.max(landmarkScore, 0.85);
    geoScore = 0.95;
  } else if (hasStructuredPremise && hasPinCode) {
    syntaxScore = 0.80;
    geoScore = 0.75;
  } else if (hasPinCode && (clean.includes('ward') || clean.includes('village') || clean.includes('tehsil') || foundLandmarks.length > 0)) {
    // Informal address with landmark or ward anchor
    syntaxScore = 0.50;
    geoScore = 0.60;
  } else if (hasPinCode) {
    syntaxScore = 0.45;
    geoScore = 0.50;
  } else {
    syntaxScore = 0.20;
    geoScore = 0.25;
  }

  let reason = 'Structured metro address with verified premise and postal code';
  if (gibberishProb > 0.6) {
    reason = 'High gibberish or insufficient character entropy detected';
  } else if (!hasStructuredPremise && hasPinCode) {
    reason = 'Informal unstructured address with landmark/ward anchor (hedged with ₹49 deposit)';
  } else if (!hasPinCode) {
    reason = 'Missing 6-digit postal PIN code anchor';
  }

  return computeADSFromComponents(syntaxScore, landmarkScore, geoScore, gibberishProb, reason);
}

export const rtoConfig = {
  mediumDepositPaisa: 4900, // Default ₹49.00
  highHoldPaisa: 9900,      // Default ₹99.00
};

export function setRTODeposits(mediumDepositInr?: number, highHoldInr?: number) {
  if (typeof mediumDepositInr === 'number' && mediumDepositInr >= 0) {
    rtoConfig.mediumDepositPaisa = Math.round(mediumDepositInr * 100);
  }
  if (typeof highHoldInr === 'number' && highHoldInr >= 0) {
    rtoConfig.highHoldPaisa = Math.round(highHoldInr * 100);
  }
}

function computeADSFromComponents(
  syntax: number,
  landmark: number,
  geo: number,
  gibberish: number,
  reason: string
): ADSScoreBreakdown {
  // ADS = 0.30 * S_syntax + 0.35 * S_landmark + 0.25 * S_geo + 0.10 * (1 - P_gibberish)
  const adsRaw = (0.30 * syntax) + (0.35 * landmark) + (0.25 * geo) + (0.10 * (1 - gibberish));
  const adsScore = Math.max(0.0, Math.min(1.0, Number(adsRaw.toFixed(3))));

  let riskTier: 'LOW' | 'MEDIUM' | 'HIGH';
  let paymentStrategy: 'DIRECT_COD' | 'REQUIRE_SHIPPING_DEPOSIT' | 'UPI_RESERVE_HOLD';
  let depositPaisa = 0;

  if (adsScore > 0.75) {
    riskTier = 'LOW';
    paymentStrategy = 'DIRECT_COD';
    depositPaisa = 0;
  } else if (adsScore >= 0.40) {
    riskTier = 'MEDIUM';
    paymentStrategy = 'REQUIRE_SHIPPING_DEPOSIT';
    depositPaisa = rtoConfig.mediumDepositPaisa;
  } else {
    riskTier = 'HIGH';
    paymentStrategy = 'UPI_RESERVE_HOLD';
    depositPaisa = rtoConfig.highHoldPaisa;
  }

  return {
    adsScore,
    syntaxScore: Number(syntax.toFixed(2)),
    landmarkScore: Number(landmark.toFixed(2)),
    geoCoherenceScore: Number(geo.toFixed(2)),
    gibberishProb: Number(gibberish.toFixed(2)),
    riskTier,
    paymentStrategy,
    depositPaisa,
    reason,
  };
}

export interface HardGateResult {
  pass: boolean;
  checks: {
    cap: boolean;
    merchant: boolean;
    category: boolean;
    status: boolean;
  };
  reason?: string;
  failureReason?: string;
  mandateSnapshot?: MandateRow;
}

/**
 * Pass 3: Deterministic Hard Gate (0 LLM)
 */
export function evaluateHardGate(params: {
  mandateId?: string;
  amountPaisa: number;
  merchant: string;
  category?: string;
}): HardGateResult {
  const db = getDb();
  let mandate = params.mandateId
    ? (db.prepare('SELECT * FROM mandates WHERE mandate_id = ?').get(params.mandateId) as MandateRow | undefined)
    : undefined;

  if (!mandate) {
    mandate = db.prepare("SELECT * FROM mandates WHERE status = 'ACTIVE' ORDER BY created_at DESC LIMIT 1").get() as MandateRow | undefined;
  }

  // Check if mandate is pending human approval or missing
  if (!mandate || mandate.status === 'PENDING_APPROVAL') {
    return {
      pass: false,
      checks: {
        cap: false,
        merchant: false,
        category: false,
        status: false,
      },
      reason: 'MANDATE_PENDING_APPROVAL: System fail-closed until human review.',
      failureReason: 'MANDATE_PENDING_APPROVAL: System fail-closed until human review.',
      mandateSnapshot: mandate,
    };
  }

  let allowedMerchants: string[] = [];
  try {
    allowedMerchants = JSON.parse(mandate.allowed_merchants);
  } catch {
    allowedMerchants = [mandate.allowed_merchants];
  }

  // Exact or case-insensitive merchant matching
  const merchantPass = allowedMerchants.some(
    m => m.toLowerCase().trim() === params.merchant.toLowerCase().trim()
  );

  const capPass = params.amountPaisa <= mandate.per_item_cap_paisa;
  const isStatusActive = mandate.status === 'ACTIVE' || mandate.status === 'PARTIALLY_DEBITED';
  const hasResidualBalance = mandate.residual_balance_paisa >= params.amountPaisa;
  const statusPass = isStatusActive && hasResidualBalance;
  const categoryPass = !params.category || params.category.toLowerCase() === mandate.category.toLowerCase();

  const allPass = merchantPass && capPass && statusPass && categoryPass;

  let reason = 'All deterministic risk gate criteria satisfied';
  if (!isStatusActive) reason = `Mandate status is ${mandate.status} (spending suspended)`;
  else if (!hasResidualBalance) reason = `Insufficient residual balance ₹${(mandate.residual_balance_paisa / 100).toFixed(2)} for requested ₹${(params.amountPaisa / 100).toFixed(2)}`;
  else if (!capPass) reason = `Requested amount ₹${(params.amountPaisa / 100).toFixed(2)} exceeds per-item cap ₹${(mandate.per_item_cap_paisa / 100).toFixed(2)}`;
  else if (!merchantPass) reason = `Merchant "${params.merchant}" is not in mandate allowlist [${allowedMerchants.join(', ')}]`;
  else if (!categoryPass) reason = `Category mismatch: expected "${mandate.category}", got "${params.category}"`;

  return {
    pass: allPass,
    checks: {
      cap: capPass,
      merchant: merchantPass,
      category: categoryPass,
      status: statusPass,
    },
    reason: allPass ? undefined : reason,
    failureReason: allPass ? undefined : reason,
    mandateSnapshot: mandate,
  };
}
