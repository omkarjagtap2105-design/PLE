# Private Loan Eligibility (PLE) — 2–3 Minute Demo Video Script

Use this comprehensive script to record the official submission video for the **Midnight Builder Challenge**.

---

## Pre-Recording Checklist
- [ ] Browser open at `http://localhost:3000` (or production URL)
- [ ] Zoom set to 100%
- [ ] Audio input tested and clear
- [ ] Review `docs/VIDEO_RECORDING_CHECKLIST.md` to ensure no secrets are exposed
- [ ] Target duration: **2 to 3 minutes**

---

## Chronological Script & Visual Cues

### [0:00 – 0:20] Step 1: Project Introduction & Mission
- **Screen**: Show homepage hero banner: *"Prove Loan Eligibility Without Exposing Your Financial Records"*.
- **Spoken Audio**:
  > *"Hello judges! Welcome to Private Loan Eligibility, or PLE, built on the Midnight Network. In traditional banking, applying for a loan forces borrowers to expose unredacted tax returns, bank statements, exact salaries, and debt balances. PLE solves this through zero-knowledge cryptography, allowing borrowers to prove creditworthiness against institutional criteria while keeping their financial data completely private."*

### [0:20 – 0:35] Step 2: Open Application & Architecture
- **Screen**: Scroll through the homepage, showcasing the feature highlights: 100% Private Witness, Compact Smart Contract, and Minimal Disclosure.
- **Spoken Audio**:
  > *"The application is a full-stack decentralized application built with React, TypeScript, Vite, and Midnight's Compact smart contract language, running on Midnight Preprod testnet."*

### [0:35 – 0:50] Step 3: Connect Lace Wallet
- **Screen**: Click **Connect Lace Wallet** in the top navigation. Show the connection modal with active address and tDUST balance.
- **Spoken Audio**:
  > *"First, we connect our wallet using the Midnight Lace DApp connector. The application dynamically handles our testnet address and tDUST balance on Midnight Preprod."*

### [0:50 – 1:05] Step 4: Loan Marketplace
- **Screen**: Scroll to the **Available Loan Products** grid. Filter by category or highlight the *Prime 30-Year Fixed Mortgage*.
- **Spoken Audio**:
  > *"Lenders publish their underwriting requirements publicly on-chain. For this Prime Mortgage, the borrower must satisfy a 700+ credit score, minimum $75,000 annual income, and a maximum 43% Debt-to-Income ratio."*

### [1:05 – 1:25] Step 5: Confidential Borrower Input
- **Screen**: Click **Verify Private Eligibility**. Enter Credit Score (740), Income ($85,000), and Monthly Debt ($1,200).
- **Spoken Audio**:
  > *"In the confidential application modal, we enter our private financial metrics: a 740 credit score, $85,000 income, and $1,200 monthly debt. Notice the client-side DTI calculation of 16.9%. These figures stay strictly in local memory and are never transmitted to the lender or ledger."*

### [1:25 – 1:50] Step 6: Zero-Knowledge Underwriting Prover
- **Screen**: Click **Generate Zero-Knowledge Eligibility Proof**. Walk through the 4-phase stepper as each step illuminates with green checkmarks.
- **Spoken Audio**:
  > *"When we click generate proof, our client-side prover initializes the witness sandbox, calculates the persistent commitment, evaluates the Compact circuit constraints, and synthesizes a zk-SNARK proof. This balanced transaction is broadcast directly to Midnight Preprod."*

### [1:50 – 2:10] Step 7: On-Chain Eligibility Certificate
- **Screen**: Display the green **Eligible for Loan** certificate modal.
- **Spoken Audio**:
  > *"And here is our verified on-chain certificate! It confirms our credit score, income, and DTI criteria are satisfied, providing a cryptographic commitment and transaction hash on Midnight Preprod without revealing our actual salary, score, or debt balances."*

### [2:10 – 2:30] Step 8: Privacy Model Deep Dive
- **Screen**: Open the **Privacy Architecture** drawer. Show Private, Public, and Proved tiers.
- **Spoken Audio**:
  > *"Our privacy architecture clearly separates private witnesses from public ledger state. The lender receives mathematical proof that we qualify without any invasive audits or data custody liabilities."*

### [2:30 – 2:45] Step 9 & 10: Midnight Preprod Contract & Codebase
- **Screen**: Switch to VS Code / GitHub repo. Show `contracts/private-loan-eligibility.compact` and the Preprod contract address: `d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2`.
- **Spoken Audio**:
  > *"Under the hood, our Compact smart contract enforces the underwriting rules with zero floating-point loss. Here is our contract deployed on Midnight Preprod."*

### [2:45 – 3:00] Step 11: GitHub Repository, CI/CD & Wrap-up
- **Screen**: Show the GitHub repo `https://github.com/omkarjagtap2105-design/PLE`, `.github/workflows/ci.yml`, and terminal showing all 19 tests passing.
- **Spoken Audio**:
  > *"The project is fully open-source with automated CI/CD, comprehensive unit tests, and security audits. Thank you for watching our demo of Private Loan Eligibility on Midnight!"*
