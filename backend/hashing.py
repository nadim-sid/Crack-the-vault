"""Password hashing schemes compared by Crack the Vault.

Each scheme exposes the same two operations:

    hash(password) -> stored string
    verify(password, stored) -> bool

so the benchmark can treat them interchangeably.
"""

import hashlib
import hmac
import os

from argon2 import PasswordHasher
from argon2.exceptions import InvalidHashError, VerificationError

SALT_BYTES = 16

# Argon2id parameters (RFC 9106 "second recommended option", also the
# argon2-cffi defaults). Pinned here so benchmark results are reproducible
# even if the library defaults change.
ARGON2_TIME_COST = 3          # iterations
ARGON2_MEMORY_COST = 65536    # KiB (64 MiB)
ARGON2_PARALLELISM = 4        # lanes
ARGON2_HASH_LEN = 32          # bytes
ARGON2_SALT_LEN = SALT_BYTES  # bytes


class SHA256:
    """Plain, unsalted SHA-256. Identical passwords give identical hashes."""

    name = "SHA-256"
    salt_used = False

    def hash(self, password: str) -> str:
        return hashlib.sha256(password.encode("utf-8")).hexdigest()

    def verify(self, password: str, stored: str) -> bool:
        return hmac.compare_digest(self.hash(password), stored)


class SaltedSHA256:
    """SHA-256 over a random per-hash salt + password.

    Stored format: "<salt hex>$<digest hex>".
    """

    name = "Salted SHA-256"
    salt_used = True

    def hash(self, password: str) -> str:
        salt = os.urandom(SALT_BYTES)
        return f"{salt.hex()}${self._digest(salt, password)}"

    def verify(self, password: str, stored: str) -> bool:
        try:
            salt_hex, digest = stored.split("$", 1)
            salt = bytes.fromhex(salt_hex)
        except ValueError:
            return False
        return hmac.compare_digest(self._digest(salt, password), digest)

    @staticmethod
    def _digest(salt: bytes, password: str) -> str:
        return hashlib.sha256(salt + password.encode("utf-8")).hexdigest()


class Argon2id:
    """Argon2id, a memory-hard password hashing function.

    The salt and parameters are embedded in the PHC-format string that
    argon2-cffi produces (e.g. "$argon2id$v=19$m=65536,t=3,p=4$...").
    """

    name = "Argon2id"
    salt_used = True

    def __init__(self):
        self._hasher = PasswordHasher(
            time_cost=ARGON2_TIME_COST,
            memory_cost=ARGON2_MEMORY_COST,
            parallelism=ARGON2_PARALLELISM,
            hash_len=ARGON2_HASH_LEN,
            salt_len=ARGON2_SALT_LEN,
        )

    def hash(self, password: str) -> str:
        return self._hasher.hash(password)

    def verify(self, password: str, stored: str) -> bool:
        try:
            return self._hasher.verify(stored, password)
        except (VerificationError, InvalidHashError):
            return False


SCHEMES = [SHA256(), SaltedSHA256(), Argon2id()]
