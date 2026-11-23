"""Verification-time benchmark for the hashing schemes.

Benchmark settings
------------------
* Each sample password in SAMPLE_PASSWORDS is hashed once per scheme.
* Each stored hash is then checked against the correct password plus every
  entry in WRONG_GUESSES, simulating an attacker testing candidate guesses.
* That set of checks is repeated ROUNDS times.
* average_ms = total verification time / number of verifications, measured
  with time.perf_counter(). Hashing time is not included.

With the defaults that is 5 passwords x 5 guesses x 3 rounds = 75
verifications per scheme.
"""

import time

from backend.hashing import (
    ARGON2_MEMORY_COST,
    ARGON2_PARALLELISM,
    ARGON2_TIME_COST,
    SCHEMES,
)

# Synthetic sample data only; no real or user-entered passwords.
SAMPLE_PASSWORDS = [
    "password123",
    "Summer2024!",
    "letmein",
    "Tr0ub4dor&3",
    "correct horse battery staple",
]

WRONG_GUESSES = [
    "123456",
    "qwerty",
    "Password1",
    "iloveyou",
]

ROUNDS = 3


def _notes(scheme, verifications):
    base = (
        f"Synthetic password benchmark: average of {verifications} verifications "
        f"({len(SAMPLE_PASSWORDS)} sample passwords x "
        f"{len(WRONG_GUESSES) + 1} guesses x {ROUNDS} rounds)"
    )
    if scheme.name == "SHA-256":
        return f"{base}. Unsalted; identical passwords share a hash."
    if scheme.name == "Salted SHA-256":
        return f"{base}. 16-byte random salt per hash."
    if scheme.name == "Argon2id":
        return (
            f"{base}. 16-byte random salt; t={ARGON2_TIME_COST}, "
            f"m={ARGON2_MEMORY_COST} KiB, p={ARGON2_PARALLELISM}."
        )
    return base


def benchmark_scheme(scheme):
    """Return the average verification time in ms for one scheme."""
    stored = {pw: scheme.hash(pw) for pw in SAMPLE_PASSWORDS}

    total_seconds = 0.0
    verifications = 0
    for _ in range(ROUNDS):
        for password, stored_hash in stored.items():
            for guess in [password, *WRONG_GUESSES]:
                start = time.perf_counter()
                matched = scheme.verify(guess, stored_hash)
                total_seconds += time.perf_counter() - start
                verifications += 1

                if matched != (guess == password):
                    raise RuntimeError(
                        f"{scheme.name} verification returned the wrong result"
                    )

    return total_seconds * 1000 / verifications, verifications


def run_benchmarks():
    """Run the benchmark for every scheme, in the CONTRACTS.md format."""
    results = []
    for scheme in SCHEMES:
        average_ms, verifications = benchmark_scheme(scheme)
        results.append(
            {
                "algorithm": scheme.name,
                "average_ms": round(average_ms, 6),
                "salt_used": scheme.salt_used,
                "notes": _notes(scheme, verifications),
            }
        )
    return {"results": results}


if __name__ == "__main__":
    import json

    print(json.dumps(run_benchmarks(), indent=2))
