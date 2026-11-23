# Hashing Backend

Compares how expensive it is to verify a password guess against three storage
schemes: plain SHA-256, salted SHA-256, and Argon2id.

## Files

- `hashing.py` — the three schemes. Each has `hash(password)` and
  `verify(password, stored)`.
- `benchmark.py` — sample passwords, benchmark settings, and `run_benchmarks()`.
- `app.py` — Flask API exposing `GET /api/benchmarks`.

## Setup and running

From the repository root:

```bash
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

python -m backend.app             # serves http://127.0.0.1:5000/api/benchmarks
python -m backend.benchmark       # prints the results without starting a server
pytest tests/backend               # runs the backend tests
```

## API

`GET /api/benchmarks` returns the format defined in `CONTRACTS.md`:

```json
{
  "results": [
    { "algorithm": "SHA-256",        "average_ms": 0.0004, "salt_used": false, "notes": "..." },
    { "algorithm": "Salted SHA-256", "average_ms": 0.0005, "salt_used": true,  "notes": "..." },
    { "algorithm": "Argon2id",       "average_ms": 18.7,   "salt_used": true,  "notes": "..." }
  ]
}
```

Values above are illustrative; real numbers depend on the machine.

The benchmark runs on the first request (a couple of seconds, mostly Argon2id)
and the result is cached. Add `?refresh=1` to re-run it. The response includes
`Access-Control-Allow-Origin: *` so the frontend can call it from another port.

## Benchmark settings

| Setting | Value |
| --- | --- |
| Sample passwords | 5 fixed synthetic passwords (`SAMPLE_PASSWORDS` in `benchmark.py`) |
| Guesses per stored hash | the correct password + 4 wrong guesses (`WRONG_GUESSES`) |
| Rounds | 3 (`ROUNDS`) |
| Verifications per algorithm | 5 × 5 × 3 = 75 |
| Timer | `time.perf_counter()` around each `verify` call; hashing time excluded |
| Salt | 16 random bytes from `os.urandom` per hash (salted SHA-256 and Argon2id) |
| Salted SHA-256 construction | `SHA-256(salt ‖ password)`, stored as `salt_hex$digest_hex` |
| Argon2id parameters | time cost 3, memory 64 MiB, parallelism 4, 32-byte hash (RFC 9106 recommendation) |

No user-entered passwords are received or stored; the backend only uses the
predefined samples.
