// Run with: node --test tests/simulator.test.js
const test = require("node:test");
const assert = require("node:assert/strict");
const { simulateAttack } = require("../modules/simulator.js");

const LIMIT = 100000;
const KEYS = ["strategy", "found", "attempts", "capped", "explanation"];

test("dictionary attack: 3 test passwords", () => {
  assert.equal(simulateAttack("password", "dictionary", LIMIT).found, true);
  assert.equal(simulateAttack("qwerty", "dictionary", LIMIT).found, true);
  assert.equal(simulateAttack("Xk9!vq72", "dictionary", LIMIT).found, false);
});

test("pattern attack: 3 test passwords", () => {
  assert.equal(simulateAttack("Summer2024!", "pattern", LIMIT).found, true);
  assert.equal(simulateAttack("p@$$w0rd", "pattern", LIMIT).found, true);
  assert.equal(simulateAttack("Xk9!vq72", "pattern", LIMIT).found, false);
});

test("bruteforce attack: 3 test passwords", () => {
  assert.equal(simulateAttack("ab1", "bruteforce", LIMIT).found, true);
  assert.equal(simulateAttack("z", "bruteforce", LIMIT).found, true);
  assert.equal(simulateAttack("AB!", "bruteforce", LIMIT).found, false);
});

test("counts attempts correctly", () => {
  assert.equal(simulateAttack("123456", "dictionary", LIMIT).attempts, 1);
  assert.equal(simulateAttack("password", "dictionary", LIMIT).attempts, 2);
  assert.equal(simulateAttack("a", "bruteforce", LIMIT).attempts, 1);
});

test("never exceeds maxGuesses and sets capped", () => {
  const r = simulateAttack("zzzz", "bruteforce", 50);
  assert.equal(r.found, false);
  assert.equal(r.attempts, 50);
  assert.equal(r.capped, true);
});

test("capped is false when found or list runs out", () => {
  assert.equal(simulateAttack("123456", "dictionary", 10).capped, false);
  const r = simulateAttack("Xk9!vq72", "dictionary", LIMIT);
  assert.equal(r.capped, false);
  assert.ok(r.attempts < LIMIT);
});

test("output matches CONTRACTS.md format", () => {
  for (const s of ["dictionary", "pattern", "bruteforce"]) {
    const r = simulateAttack("hello", s, 1000);
    assert.deepEqual(Object.keys(r), KEYS);
    assert.equal(r.strategy, s);
    assert.equal(typeof r.explanation, "string");
  }
});

test("rejects bad input", () => {
  assert.throws(() => simulateAttack("x", "rainbow", 10));
  assert.throws(() => simulateAttack("x", "dictionary", 0));
  assert.throws(() => simulateAttack(123, "dictionary", 10));
});
