# Private Loan Eligibility (PLE) — 2-Minute Demo Video Script

Use this script to record the official submission video for the Midnight Builder Challenge.

---

## Pre-Recording Checklist
- [ ] Browser open at `http://localhost:3000` (or production URL)
- [ ] Zoom set to 100%
- [ ] Audio input tested and clear
- [ ] Target duration: **under 2 minutes**

---

## Recording Script & Timeline

### 0:00 – 0:25: Introduction & Problem Statement
- **Visual**: Show homepage hero banner: *"Prove Loan Eligibility Without Exposing Your Financial Records"*.
- **Speech**:
  > *"Welcome to Private Loan Eligibility (PLE) built on the Midnight Network. Today, applying for a loan requires exposing your most sensitive financial secrets: tax returns, salary slips, and exact credit card balances. PLE solves this with Zero-Knowledge proofs, allowing borrowers to prove creditworthiness without revealing a single private figure."*

### 0:25 – 0:45: Lace Wallet Connection
- **Visual**: Click **Connect Lace Wallet** in the top navigation.
- **Visual**: Show the connection modal detailing Midnight Preprod network, active address, and tDUST balance.
- **Speech**:
  > *"First, we connect to the Midnight Preprod testnet using our Midnight Lace Wallet. The DApp dynamically tracks our connected address and testnet balance."*

### 0:45 – 1:15: Underwriting Criteria & Private Input
- **Visual**: Scroll to **Available Loan Products**. Hover over *Prime 30-Year Fixed Mortgage*. Point out public criteria: 700+ FICO, $75,000 income, ≤ 43% DTI.
- **Visual**: Click **Verify Private Eligibility**.
- **Visual**: Enter FICO score (740), Income ($85,000), Monthly Debt ($1,200). Note live DTI calculation (16.9%) and privacy notice: *"Processed Client-Side Only"*.
- **Speech**:
  > *"Here we select a Prime Mortgage with institutional underwriting criteria. In the confidential application modal, we input our sensitive data: 740 credit score, $85k annual income, and $1,200 in monthly debts. Notice that these values stay strictly inside our browser memory and are never transmitted to the lender or public ledger."*

### 1:15 – 1:40: Zero-Knowledge Prover Stepper
- **Visual**: Click **Generate Zero-Knowledge Eligibility Proof**.
- **Visual**: Show the 4-stage stepper:
  1. Initialize Private Witness
  2. Commitment & Underwriting Circuit
  3. Synthesize Zero-Knowledge Proof
  4. Midnight Preprod Confirmation
- **Speech**:
  > *"When we generate the proof, our Compact circuit evaluates the mathematical constraints in zero knowledge: credit score above threshold, income above threshold, and debt-to-income ratio satisfied. The proof is synthesized and broadcast as a balanced transaction to Midnight Preprod."*

### 1:40 – 2:00: Verification Certificate & Conclusion
- **Visual**: Display green **Eligible for Loan** certificate with on-chain transaction hash and cryptographic commitment.
- **Visual**: Click **Privacy Architecture** in the header to briefly showcase the 3-tier privacy model (Private, Public, Proved).
- **Speech**:
  > *"Upon finality, we receive an on-chain verified eligibility certificate. The lender receives mathematical certainty that we qualify, while our exact salary, score, and debts remain completely private. This is the future of confidential lending on Midnight."*
