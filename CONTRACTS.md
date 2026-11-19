# Integration Contracts

This file defines the inputs and outputs for each component so we can work on separate parts and connect them later. How each part is implemented is up to the developer, as long as it follows these formats.

## 1. Password Analyzer

**File:** `modules/analyzer.js`

**Function:**
```javascript
analyzePassword(password)
```

Input: A password string.

Returns:
```json
{
  "basic": {
    "score": 3,
    "label": "Good"
  },
  "smart": {
    "score": 1,
    "label": "Weak"
  },
  "warnings": ["Common password pattern"],
  "suggestions": ["Avoid predictable endings"]
}
```

Both scores range from 0 to 4 (Very Weak, Weak, Fair, Good, Strong). The example values are just to show the format.

## 2. Attack Simulator

**File:** `modules/simulator.js`

**Function:**
```javascript
simulateAttack(password, strategy, maxGuesses)
```

Inputs:
- `password`: test password
- `strategy`: `dictionary`, `pattern`, or `bruteforce`
- `maxGuesses`: maximum attempts allowed

Returns:
```json
{
  "strategy": "dictionary",
  "found": true,
  "attempts": 150,
  "capped": false,
  "explanation": "Password found in dictionary"
}
```

`found` indicates whether the password was guessed. `attempts` is the actual number of guesses. `capped` indicates whether the attempt limit stopped the search.

The simulator should not exceed `maxGuesses`.

## 3. Hashing Backend

**Folder:** `backend/`

**Endpoint:**
```http
GET /api/benchmarks
```

Returns:
```json
{
  "results": [
    {
      "algorithm": "Argon2id",
      "average_ms": 0.0,
      "salt_used": true,
      "notes": "Synthetic password benchmark"
    }
  ]
}
```

This is an example format, not an actual benchmark measurement.

The results should include SHA-256, salted SHA-256, and Argon2id. `average_ms` should contain the measured average verification time in milliseconds. The backend should document its benchmark settings.

Only predefined sample passwords are used for backend benchmarks.

## 4. Frontend

**Folder:** `frontend/`

The frontend will use the analyzer and simulator functions and fetch the hashing results from `/api/benchmarks`.

Mock results can be used initially, as long as they follow the formats above.

The analyzer and simulator should export their functions as JavaScript ES modules so they can be imported directly.

## General

- Each component should work and be testable independently.
- Internal implementation and libraries can vary.
- Keep the agreed function names and response formats consistent.
- Passwords entered by users should not be stored or sent to the backend.
- Attack simulations should run locally with limited attempts.