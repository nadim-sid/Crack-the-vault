"""Flask API serving the hashing benchmark results.

Run from the repository root:

    python -m backend.app
"""

from flask import Flask, jsonify, request

from backend.benchmark import run_benchmarks

app = Flask(__name__)

# Argon2id makes a full run take a couple of seconds, so results are computed
# on the first request and reused. Pass ?refresh=1 to re-run the benchmark.
_cached_results = None


@app.get("/api/benchmarks")
def benchmarks():
    global _cached_results
    if _cached_results is None or request.args.get("refresh") == "1":
        _cached_results = run_benchmarks()
    return jsonify(_cached_results)


@app.after_request
def allow_cross_origin(response):
    # The frontend may be served from a different port during development.
    response.headers["Access-Control-Allow-Origin"] = "*"
    return response


if __name__ == "__main__":
    app.run(port=5000, debug=True)
