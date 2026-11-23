/**
 * Crack the Vault - Attack Simulator
 *
 * Contract (CONTRACTS.md, section 2):
 *   simulateAttack(password, strategy, maxGuesses)
 *
 *   password   - test password (string)
 *   strategy   - "dictionary" | "pattern" | "bruteforce"
 *   maxGuesses - maximum attempts allowed (positive integer)
 *
 *   Returns:
 *   {
 *     strategy:    "dictionary",
 *     found:       true,     // was the password guessed?
 *     attempts:    150,      // actual number of guesses made
 *     capped:      false,    // did the attempt limit stop the search?
 *     explanation: "Password found in dictionary"
 *   }
 *
 * The simulator never makes more than maxGuesses attempts.
 * Everything runs locally against test strings only.
 */

// Small built-in list of very common passwords (most common first).
const COMMON_PASSWORDS = [
  "123456", "password", "123456789", "12345678", "12345", "qwerty",
  "abc123", "football", "monkey", "letmein", "111111", "1234567",
  "dragon", "baseball", "sunshine", "iloveyou", "trustno1", "princess",
  "admin", "welcome", "login", "master", "hello", "freedom", "whatever",
  "shadow", "superman", "michael", "summer", "winter", "secret",
  "starwars", "pokemon", "computer", "cheese", "flower", "soccer",
];

const LEET_MAP = { a: "@", e: "3", i: "1", o: "0", s: "$", t: "7" };
const COMMON_SUFFIXES = ["!", "!!", "?", "@", "#", "$", "123", "1234", "!@#"];
const BRUTEFORCE_CHARSET = "abcdefghijklmnopqrstuvwxyz0123456789";
const BRUTEFORCE_MAX_LENGTH = 4;

// ---------------------------------------------------------------------------
// Guess generators (each yields candidate guesses one at a time)
// ---------------------------------------------------------------------------

function* dictionaryGuesses(wordlist = COMMON_PASSWORDS) {
  yield* wordlist;
}

function capitalize(word) {
  return word.charAt(0).toUpperCase() + word.slice(1);
}

function leet(word) {
  return [...word].map((c) => LEET_MAP[c.toLowerCase()] || c).join("");
}

/** Common human tweaks of one word, most likely first, no duplicates. */
function* variationsOf(word) {
  const seen = new Set();
  const bases = [];
  for (const v of [word, capitalize(word), word.toUpperCase()]) {
    bases.push(v, leet(v));
  }

  function* fresh(candidates) {
    for (const c of candidates) {
      if (!seen.has(c)) {
        seen.add(c);
        yield c;
      }
    }
  }

  // 1. Base word, capitalized, uppercase, and leetspeak versions
  yield* fresh(bases);
  // 2. Symbol / number suffixes: password!, Password123
  for (const b of bases) yield* fresh(COMMON_SUFFIXES.map((s) => b + s));
  // 3. Numbers 0-99: password1, password07
  for (const b of bases) {
    for (let n = 0; n < 100; n++) {
      yield* fresh([b + n, b + String(n).padStart(2, "0")]);
    }
  }
  // 4. Years, optionally with "!": summer2024, Summer2024!
  for (const b of bases) {
    for (let y = 1970; y <= 2030; y++) yield* fresh([b + y, b + y + "!"]);
  }
}

function* patternGuesses(wordlist = COMMON_PASSWORDS) {
  for (const word of wordlist) yield* variationsOf(word);
}

/** Every combination of the charset, shortest first. */
function* bruteforceGuesses(
  charset = BRUTEFORCE_CHARSET,
  maxLength = BRUTEFORCE_MAX_LENGTH
) {
  for (let length = 1; length <= maxLength; length++) {
    const idx = new Array(length).fill(0);
    while (true) {
      yield idx.map((i) => charset[i]).join("");
      // Increment like an odometer
      let pos = length - 1;
      while (pos >= 0 && ++idx[pos] === charset.length) {
        idx[pos] = 0;
        pos--;
      }
      if (pos < 0) break;
    }
  }
}

const STRATEGIES = {
  dictionary: {
    guesses: dictionaryGuesses,
    foundMsg: "Password found in dictionary",
    exhaustedMsg: "Password not in the common password list",
  },
  pattern: {
    guesses: patternGuesses,
    foundMsg: "Password found as a variation of a common word",
    exhaustedMsg: "Password does not match any common pattern",
  },
  bruteforce: {
    guesses: bruteforceGuesses,
    foundMsg: "Password found by trying every combination",
    exhaustedMsg: `Password not found in all lowercase/digit combinations up to ${BRUTEFORCE_MAX_LENGTH} characters`,
  },
};

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

function simulateAttack(password, strategy, maxGuesses) {
  if (typeof password !== "string") {
    throw new TypeError("password must be a string");
  }
  const config = STRATEGIES[strategy];
  if (!config) {
    throw new Error(
      `Unknown strategy "${strategy}". Use dictionary, pattern, or bruteforce.`
    );
  }
  if (!Number.isInteger(maxGuesses) || maxGuesses < 1) {
    throw new Error("maxGuesses must be a positive integer");
  }

  let attempts = 0;
  for (const guess of config.guesses()) {
    if (attempts >= maxGuesses) {
      return {
        strategy,
        found: false,
        attempts,
        capped: true,
        explanation: `Stopped after reaching the limit of ${maxGuesses} guesses`,
      };
    }
    attempts++;
    if (guess === password) {
      return {
        strategy,
        found: true,
        attempts,
        capped: false,
        explanation: config.foundMsg,
      };
    }
  }

  // Ran out of guesses to try before hitting the limit
  return {
    strategy,
    found: false,
    attempts,
    capped: false,
    explanation: config.exhaustedMsg,
  };
}

// Works with Node (require) and as a plain <script> in the browser.
if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    simulateAttack,
    COMMON_PASSWORDS,
    variationsOf,
  };
} else if (typeof window !== "undefined") {
  window.simulateAttack = simulateAttack;
}

// Demo: node modules/simulator.js
if (typeof require !== "undefined" && require.main === module) {
  for (const pw of ["password", "Summer2024!", "ab1", "zq9x!Lm#2026"]) {
    console.log(`\nTarget: ${pw}`);
    for (const s of ["dictionary", "pattern", "bruteforce"]) {
      const r = simulateAttack(pw, s, 100000);
      console.log(
        `  ${s.padEnd(11)} found=${String(r.found).padEnd(5)} ` +
          `attempts=${String(r.attempts).padStart(6)} capped=${r.capped}`
      );
    }
  }
}
