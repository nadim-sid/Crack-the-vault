import pytest

from backend.hashing import SCHEMES, SHA256, Argon2id, SaltedSHA256

SCHEME_IDS = [scheme.name for scheme in SCHEMES]


@pytest.mark.parametrize("scheme", SCHEMES, ids=SCHEME_IDS)
def test_correct_password_verifies(scheme):
    stored = scheme.hash("Summer2024!")
    assert scheme.verify("Summer2024!", stored) is True


@pytest.mark.parametrize("scheme", SCHEMES, ids=SCHEME_IDS)
def test_incorrect_password_fails(scheme):
    stored = scheme.hash("Summer2024!")
    assert scheme.verify("summer2024!", stored) is False
    assert scheme.verify("Summer2024", stored) is False
    assert scheme.verify("", stored) is False


@pytest.mark.parametrize("scheme", SCHEMES, ids=SCHEME_IDS)
def test_unicode_password_round_trips(scheme):
    stored = scheme.hash("pässwörd-🔒")
    assert scheme.verify("pässwörd-🔒", stored) is True
    assert scheme.verify("passwort-🔒", stored) is False


@pytest.mark.parametrize("scheme", SCHEMES, ids=SCHEME_IDS)
def test_malformed_stored_hash_fails(scheme):
    assert scheme.verify("password123", "not-a-hash") is False


def test_sha256_matches_known_digest():
    assert SHA256().hash("password123") == (
        "ef92b778bafe771e89245b89ecbc08a44a4e166c06659911881f383d4473e94f"
    )


def test_sha256_is_deterministic():
    scheme = SHA256()
    assert scheme.hash("letmein") == scheme.hash("letmein")


def test_salted_sha256_uses_new_salt_each_hash():
    scheme = SaltedSHA256()
    first = scheme.hash("letmein")
    second = scheme.hash("letmein")

    assert first != second
    assert first.split("$")[0] != second.split("$")[0]
    assert len(bytes.fromhex(first.split("$")[0])) == 16
    assert scheme.verify("letmein", first)
    assert scheme.verify("letmein", second)


def test_argon2id_uses_new_salt_each_hash():
    scheme = Argon2id()
    first = scheme.hash("letmein")
    second = scheme.hash("letmein")

    assert first.startswith("$argon2id$")
    assert first != second
