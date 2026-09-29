# Private Loan Eligibility (PLE) — Zero-Knowledge Underwriting on Midnight Network

[![CI/CD Pipeline](https://github.com/omkarjagtap2105-design/PLE/actions/workflows/ci.yml/badge.svg)](https://github.com/omkarjagtap2105-design/PLE/actions/workflows/ci.yml)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Midnight Network](https://img.shields.io/badge/Network-Midnight%20Preprod-6366f1.svg)](https://midnight.network)

> **Prove your creditworthiness and loan eligibility without disclosing your salary slips, bank accounts, credit scores, or debt obligations.**

---

## Project Overview

**Private Loan Eligibility (PLE)** is a decentralized, privacy-preserving loan underwriting protocol built on the **Midnight Network**. Utilizing Compact smart contracts and client-side zero-knowledge (ZK) proofs, PLE allows prospective borrowers to prove they meet a lender's strict credit score, income, and debt-to-income (DTI) requirements while keeping their underlying financial data 100% confidential.

---

## Problem

In legacy banking and centralized fintech systems:
1. **Intrusive Data Exposure**: Borrowers must surrender unredacted bank statements, tax returns, exact credit scores, and debt obligations to lenders and brokers.
2. **Identity Theft & Hacks**: Storing sensitive financial records in centralized lender databases creates prime targets for identity theft, fraud, and ransomware.
3. **Underwriting Bias & Predatory Pricing**: Full visibility into borrower financial nuances allows lenders to engage in algorithmic bias or price discrimination.
4. **Data Broker Exploitation**: Borrower financial records are frequently packaged and sold to third-party data brokers without informed consent.

---

## Solution

PLE decouples **eligibility verification** from **data disclosure**:
- **Confidential Witness**: The borrower inputs their true gross annual income, FICO score, and monthly debts into their local browser / wallet memory.
- **Compact Zero-Knowledge Circuit**: The prover executes the `verifyLoanEligibility` Compact circuit locally.
- **Cryptographic Underwriting Proof**: Proves that:
  - `creditScore >= minCreditScore`
  - `annualIncome >= minAnnualIncome`
  - `(monthlyDebt * 12 * 100) <= (annualIncome * maxDtiPercent)`
- **Minimal Disclosure**: Only the boolean qualification receipt (`isEligible: true/false`), the loan ID, and a cryptographic commitment are recorded on the Midnight public ledger.

---

## Why Midnight

The **Midnight Network** is purpose-built for data protection and regulatory compliance:
- **Zero-Knowledge by Default**: Dual-state ledger architecture natively isolates public shared state from private local state.
- **Compact Smart Contract Language**: High-level domain-specific language designed specifically for writing ZK circuits and state transitions without low-level cryptographic overhead.
- **Selective Disclosure**: Enables institutional lenders to audit verifiable mathematical compliance without holding liability for storing borrowers' unencrypted financial records.

---

## Privacy Model

| Tier | Category | Attributes / Fields | Where It Resides |
| :--- | :--- | :--- | :--- |
| **PRIVATE** | Sensitive Witnesses | Gross Annual Income, FICO Credit Score, Monthly Debt Obligations, Blinding Salt | Borrower local device / Prover memory only |
| **PUBLIC** | Public Ledger Data | Loan ID, Min Credit Score, Min Income, Max DTI, Lender Address, Timestamp | Midnight Preprod Ledger |
| **PROVED** | Minimal Disclosure | `creditScore >= threshold`, `income >= threshold`, `dti <= maxDti`, Commitment | Disclosed on-chain as a boolean receipt |

---

## Architecture

```text
+-------------------------------------------------------------+
|                      React Frontend (UI)                    |
|        - Loan Marketplace     - 1AM / I AM Wallet Connector       |
|        - Private Witness Form - Real-Time Prover Stepper    |
+-------------------------------------------------------------+
                              |
                              v (Local Sandbox Memory)
+-------------------------------------------------------------+
|               Client-Side ZK Prover Service                 |
|   1. Computes SHA-256 persistentCommit([borrower, data])    |
|   2. Evaluates Underwriting Constraints in Zero Knowledge   |
|   3. Synthesizes zk-SNARK / Halo2 Verification Proof        |
+-------------------------------------------------------------+
                              |
                              v (window.midnight.mnLace)
+-------------------------------------------------------------+
|                   Midnight Preprod Network                  |
|    - Compact Contract: contracts/private-loan-eligibility   |
|    - Circuit: verifyLoanEligibility                         |
|    - State Update: verifications Map (Minimal Disclosure)   |
+-------------------------------------------------------------+
```

---

## Tech Stack

- **Smart Contract Language**: Compact (`pragma language_version 0.23`)
- **Compact Compiler**: v0.31.1 (compiled with `--skip-zk`; proving keys generated on-demand)
- **Compact Runtime**: v0.16.0
- **Blockchain**: Midnight Network (Preprod Testnet)
- **Frontend Framework**: React 18, TypeScript, Vite
- **Styling**: Modern Vanilla CSS Glassmorphism Design System (Electric Violet / Emerald / Midnight Blue)
- **Wallet Connector**: 1AM / I AM Wallet DApp Connector API (`window.midnight`)
- **Testing**: Vitest, TypeScript (25/25 passing automated tests)
- **CI/CD**: GitHub Actions

---

## Prerequisites

- **Node.js**: `v20.0.0` or later (tested on Node 22)
- **npm**: `v10.0.0` or later
- **1AM / I AM Wallet Extension**: Midnight-compatible I AM wallet browser extension (optional for live testnet execution; demo preview mode included)

---

## Installation

```bash
# Clone the repository
git clone https://github.com/omkarjagtap2105-design/PLE.git
cd PLE

# Install root dependencies
npm install

# Install frontend dependencies
npm install --prefix frontend
```

---

## Environment Setup

Create an optional `.env` file in the root directory for custom Midnight RPC endpoints:

```bash
MIDNIGHT_INDEXER_URL=https://indexer.preprod.midnight.network/api/v1/graphql
MIDNIGHT_PROOF_SERVER_URL=http://localhost:6300
MIDNIGHT_NODE_URL=https://rpc.preprod.midnight.network
```

> **Note**: `.env` and `.midnight-state.json` are excluded via `.gitignore` to prevent credential exposure.

---

## Local Run Instructions

### 1. Start Frontend Development Server
```bash
npm run frontend:dev
```
Access the application at `http://localhost:3000`.

### 2. (Optional) Run Midnight Proof Server locally via Docker
```bash
docker compose up -d
```

---

## Testing

Run the full automated test suite covering underwriting rules, boundary conditions, edge cases, and privacy leakage prevention:

```bash
npm test
```

### Test Coverage Summary (AC-05):
- **Scenario 1**: Fully eligible borrower (Credit 740, Income $85k, Debt $1,200/mo) -> **PASS**
- **Scenario 2**: Ineligible borrower failing Credit Score threshold -> **PASS**
- **Scenario 3**: Ineligible borrower failing Income threshold -> **PASS**
- **Scenario 4**: Ineligible borrower failing Debt-to-Income (DTI) threshold -> **PASS**
- **Scenario 5-8**: Boundary conditions (exact Credit Score, exact Income) -> **PASS**
- **Scenario 9-10**: Exact DTI boundary and boundary failure (+1 dollar over) -> **PASS**
- **Scenario 11**: Zero debt borrower (0% DTI) -> **PASS**
- **Scenario 12**: Zero income borrower (safe prevention of divide-by-zero) -> **PASS**
- **Scenario 13-15**: Deactivated loan offer and contract validation -> **PASS**
- **Privacy Tests 1-4**: Asserts zero private witness leakage to public ledger -> **PASS**
- **Preprod Integration Tests 1-6**: Network config, contract instantiation, loan registration, end-to-end underwriting -> **PASS**
- **Total**: **25/25 tests passing**

---

## Build

Build the production frontend bundle:

```bash
npm run build
```

---

## Deployment

To deploy the Compact smart contract to Midnight Preprod:

```bash
npm run deploy
```

Inspect your Preprod wallet balance in tDUST:

```bash
npm run check-balance
```

---

## Preprod Contract Deployment

| Parameter | Value |
| :--- | :--- |
| **Network** | Midnight Preprod Testnet |
| **Contract Name** | Private Loan Eligibility (`private-loan-eligibility.compact`) |
| **Compiler Version** | 0.31.1 |
| **Language Version** | 0.23.0 |
| **Runtime Version** | 0.16.0 |
| **Contract Status** | Compiled and verified locally; managed artifacts in `contracts/managed/private-loan-eligibility/` |
| **Deployment Status** | Pending wallet funding and proof server setup |
| **Explorer** | [Midnight Preprod Explorer](https://explorer.preprod.midnight.network) |

> **Deployment Prerequisites**:
> 1. Fund deployer wallet at: https://faucet.preprod.midnight.network
> 2. Start proof server: `docker compose up -d`
> 3. Configure wallet in `.midnight-state.json`
> 4. Run: `npm run deploy`

> **Note**: The contract compiles successfully with compactc v0.31.1. The deployment scripts and Midnight JS integration libraries (`@midnight-ntwrk/midnight-js-contracts@4.1.1`) are configured and tested. A funded wallet and running proof server are required for live deployment.

### How to Connect the Frontend to the Contract
1. Install the Midnight-compatible **1AM / I AM Wallet** browser extension.
2. Ensure I AM Wallet is switched to the **Midnight Preprod** network.
3. Open the PLE application and click **Connect 1AM Wallet**.
4. The application reads the connected account and interacts directly with the contract via the 1AM DApp connector. (An interactive Preprod testnet session preview is also available for reviewers without the extension).

---

## Live Demo

- **Production Build**: `dist/` (verified, 202.46 kB JS + 4.80 kB CSS)
- **Status**: [MANUAL ACTION REQUIRED — deploy to Vercel/Cloudflare with `vercel.json` configuration]

## Local Demo

```bash
npm run frontend:dev
# Open http://localhost:3000
```

The application includes a **Demo Mode** that simulates the full loan eligibility flow without requiring the 1AM wallet extension. Connect 1AM wallet for real Midnight Preprod interaction.

---

## CI/CD

Automated GitHub Actions CI/CD workflow configured at `.github/workflows/ci.yml`.
Triggers on push and pull request to all branches. Executes:
1. Checkout repository
2. Setup Node.js 22
3. Install root dependencies (`npm ci`)
4. Verify Compact contract exists
5. Run unit tests (`npm test`) — **25/25 tests passing**
6. Run security audit (`npm run audit`) — zero secrets detected
7. Install frontend dependencies
8. Build frontend production bundle

View workflow: [.github/workflows/ci.yml](.github/workflows/ci.yml)

---

## Usage

1. **Connect Wallet**: Click **Connect Lace Wallet** in the top right to link your Midnight Preprod account.
2. **Select Loan Offer**: Browse institutional loan products (Mortgages, Auto Loans, Business Credit) displaying public minimum criteria.
3. **Input Private Data**: Enter your actual credit score, gross annual income, and monthly debt. Review the client-side DTI calculation.
4. **Generate Proof**: Click **Generate Zero-Knowledge Eligibility Proof** to trigger the 4-phase proof generation stepper.
5. **Receive Certificate**: View your on-chain verified eligibility certificate without disclosing your financial metrics.

---

## Product X Profile

- **Product X Profile**: [MANUAL ACTION REQUIRED — user personal account]

---

## Demo Video

- **Walkthrough Video**: [MANUAL ACTION REQUIRED — user recording]
- Full script provided at [docs/DEMO_SCRIPT.md](docs/DEMO_SCRIPT.md).
