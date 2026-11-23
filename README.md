# Crack the Vault

CSC 38000 —  Final Project

**Team:** Nadim Siddique, Mashiyat Jahin, Hsaung Soe, Mohammed Islam

## Project Overview

Crack the Vault is a password security web application. We want to compare how traditional password-strength rules perform against more realistic password-guessing methods. We will also look at how different hashing methods affect the cost of offline password attacks.

The application will have four main parts:

1. **Frontend:** Website where users can enter test passwords, choose attack scenarios, and view results.
2. **Password Analyzer:** Compares traditional password rules against common passwords and predictable patterns.
3. **Attack Simulator:** Runs controlled dictionary, pattern-based, and limited brute-force guessing simulations.
4. **Cryptography Backend:** Compares SHA-256, salted SHA-256, and Argon2id using synthetic password samples.

## Project Structure

- `frontend/` — Website, UI, and results display
- `modules/` — Password analyzer and attack simulator
- `backend/` — Hashing experiments and backend API
- `tests/` — Unit tests and sample test cases
- `requirements.txt` — Python dependencies
- `CONTRACTS.md` — Expected inputs, outputs, and integration rules

## Team Development

Each member will pick one of the four components and be responsible for implementing, testing, and documenting it.

Everyone should work on their own Git branch and submit a pull request when their part is ready.

Suggested branches:

- `feature/frontend`
- `feature/analyzer`
- `feature/simulator`
- `feature/crypto-backend`

Each person can choose their own implementation approach as long as it works with the shared interfaces in `CONTRACTS.md`.

## Working Independently

The goal is to avoid having to wait for another person's code.

The frontend developer can use sample/mock results while building the website. The analyzer and simulator developers can test their functions independently using sample passwords. The backend developer can test the hashing experiments without needing the frontend.

**Before coding, read `CONTRACTS.md`.** It defines the expected inputs and outputs for each component. If something needs to change, discuss it with the team before changing the interface.

## GitHub Workflow

1. Pick a task from GitHub Issues.
2. Create a feature branch.
3. Implement and test your component.
4. Push the branch to GitHub.
5. Open a pull request describing what was completed and how to test it.
6. Review and merge after confirming that the integration contract is still satisfied.

## Security and Scope

All attack simulations will be bounded and use test passwords. Passwords entered into the analyzer will not be saved or sent to the backend. Hashing benchmarks will use predefined sample data.

The initial version does not need user accounts, a database, or online deployment.
