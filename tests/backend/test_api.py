import pytest

from backend.app import app


@pytest.fixture(scope="module")
def response():
    return app.test_client().get("/api/benchmarks")


def test_returns_ok_json(response):
    assert response.status_code == 200
    assert response.is_json


def test_matches_contract_format(response):
    body = response.get_json()
    assert list(body) == ["results"]

    for result in body["results"]:
        assert set(result) == {"algorithm", "average_ms", "salt_used", "notes"}
        assert isinstance(result["algorithm"], str)
        assert isinstance(result["average_ms"], float)
        assert result["average_ms"] > 0
        assert isinstance(result["salt_used"], bool)
        assert isinstance(result["notes"], str)


def test_includes_all_algorithms(response):
    results = {r["algorithm"]: r for r in response.get_json()["results"]}

    assert set(results) == {"SHA-256", "Salted SHA-256", "Argon2id"}
    assert results["SHA-256"]["salt_used"] is False
    assert results["Salted SHA-256"]["salt_used"] is True
    assert results["Argon2id"]["salt_used"] is True


def test_argon2id_is_slowest(response):
    results = {r["algorithm"]: r["average_ms"] for r in response.get_json()["results"]}
    assert results["Argon2id"] > results["SHA-256"]
    assert results["Argon2id"] > results["Salted SHA-256"]
