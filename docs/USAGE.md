# Private Loan Eligibility (PLE) — User & Developer Guide

This guide provides end-to-end instructions for interacting with the **Private Loan Eligibility** DApp on Midnight Network.

---

## 1. Architecture Overview

PLE employs client-side zero-knowledge proofs to allow borrowers to satisfy underwriting criteria without disclosing sensitive financial metrics.

```text
+-------------------+           +-----------------------+           +----------------------+
|     Borrower      |           |     Local Prover      |           |   Midnight Preprod   |
| (Private Inputs)  |           |     (ZK Circuit)      |           |    (Public Ledger)   |
+-------------------+           +-----------------------+           +----------------------+
          |                                 |                                  |
          |--- [Credit, Income, Debt] ----->|                                  |
          |                                 |--- Evaluates Constraints ------->|
          |                                 |--- Computes Commitment --------->|
          |                                 |--- Generates zk-SNARK ---------->|
          |                                 |                                  |
          |                                 |------- Submit Tx (Lace) -------->|
          |                                 |                                  |
          |<---------- Receives Eligibility Certificate -----------------------|
```

---

## 2. Borrower Walkthrough

### Step 1: Connecting Lace Wallet
1. Open the PLE application in your browser.
2. Click **Connect Lace Wallet** in the upper right corner.
3. If the Midnight Lace extension is detected, approve the DApp connection prompt.
4. If reviewing without the extension, click **Interactive Preprod Testnet Session** to preview the full flow.

### Step 2: Selecting a Loan Product
Browse the **Available Loan Products** grid:
- **Prime 30-Year Fixed Mortgage**: 700+ FICO, $75k/yr income, ≤ 43% DTI
- **Eco Clean Mobility Auto Loan**: 660+ FICO, $40k/yr income, ≤ 45% DTI
- **Web3 & Tech SME Working Capital**: 680+ FICO, $100k/yr income, ≤ 38% DTI
- **Flexible Unsecured Personal Credit**: 640+ FICO, $35k/yr income, ≤ 50% DTI

Click **Verify Private Eligibility** on your chosen loan.

### Step 3: Entering Confidential Financial Witnesses
In the application modal:
- **Credit Score (FICO)**: Adjust slider or enter your exact score (e.g., 740).
- **Gross Annual Income**: Enter your annual earnings in USD (e.g., $85,000).
- **Total Monthly Debt Payments**: Enter monthly debt payments (credit cards, existing loans).
- Notice the live DTI calculation:
  $$\text{DTI} = \frac{\text{Monthly Debt} \times 12}{\text{Annual Income}} \times 100\%$$
- Notice that your data is marked with: **"🔒 Processed Client-Side Only"**.

### Step 4: Executing the Zero-Knowledge Proof
Click **Generate Zero-Knowledge Eligibility Proof**:
1. **Witness Initialization**: Values loaded into browser memory sandbox.
2. **Commitment & Underwriting Circuit**: Persistent commitment computed.
3. **ZK-Proof Synthesis**: Compact constraints proven using zk-SNARK prover.
4. **Midnight Preprod Broadcast**: Balanced transaction sent to Midnight testnet.

### Step 5: Viewing the On-Chain Eligibility Certificate
Upon transaction finality:
- **Eligible**: Green verification certificate confirming all institutional underwriting criteria were met.
- **Ineligible**: Red explanation highlighting which threshold was not satisfied.
- Displays the **Cryptographic Commitment** and **Preprod Transaction Hash**.

---

## 3. Lender Walkthrough (Creating Loan Offers)

Lenders can register new loan products directly on the protocol:
1. Click **Offer Loan** in the navigation bar.
2. Enter product details:
   - Title (e.g., "Medical Professional Mortgage")
   - Category (Mortgage, Auto, Personal, Business)
   - Principal Amount ($)
   - Interest Rate (APR %)
3. Define strict underwriting criteria:
   - Minimum Credit Score (300–850)
   - Minimum Annual Income ($)
   - Maximum Allowed DTI Ratio (%)
4. Click **Publish Loan Underwriting Terms** to broadcast the offer.

---

## 4. Troubleshooting & FAQ

### Q: Does the lender or Midnight validator see my salary?
**No.** All salary, debt, and credit score figures are passed as *circuit witnesses* in local memory. The Compact compiler and ZK prover generate a mathematical proof that the conditions hold without disclosing the witnesses.

### Q: What if I don't have the Lace extension installed?
The DApp includes a full **Interactive Preprod Testnet Session** allowing developers, reviewers, and users to test the complete underwriting flow, circuit execution, and UI states directly.

### Q: How is Debt-to-Income calculated in the circuit?
To avoid floating-point inaccuracies in zero-knowledge circuits, the formula uses integer arithmetic:
$$(\text{monthlyDebt} \times 12 \times 100) \le (\text{annualIncome} \times \text{maxDtiPercent})$$
Zero income is guarded against to prevent division-by-zero exceptions.
