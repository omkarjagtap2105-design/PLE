# Video Recording Security & Production Checklist

Follow this checklist when recording the official submission video for **Private Loan Eligibility (PLE)**.

---

## 🛑 STRICT PRIVACY & SECURITY RULES (WHAT NOT TO EXPOSE)

> [!CAUTION]
> If any secret or credential is shown on screen, the video and wallet may be compromised.

- [ ] **NO Seed Phrases**: Never open wallet recovery phrase settings or `.midnight-state.json`.
- [ ] **NO Private Keys**: Keep developer consoles, terminal environment exports, and `.env` files closed.
- [ ] **NO Passwords or Pins**: Do not type wallet unlocking passwords on screen (unlock wallet before recording).
- [ ] **NO Real Personal Financial Identifiers**: Use the provided demo values (FICO 740, Income $85,000, Debt $1,200) instead of personal bank records.
- [ ] **Close Background Tabs**: Close personal email, Discord, personal Telegram, and private browser tabs.

---

## 🎯 WHAT TO SHOW (THE 11 MANDATORY STEPS)

1. **[0:00 – 0:15] Introduction**:
   - Show project title: *"Private Loan Eligibility (PLE) — Zero-Knowledge Underwriting on Midnight Network"*.
   - Explain the core mission: proving borrower qualification without revealing salary slips, credit card balances, or personal finances.

2. **[0:15 – 0:30] Open Application**:
   - Show clean, responsive dark-mode glassmorphic interface at `http://localhost:3000` (or live URL).
   - Point out Midnight Preprod status indicator in the navigation bar.

3. **[0:30 – 0:45] Connect Lace Wallet**:
   - Click **Connect Lace Wallet**.
   - Show connection modal tracking active Midnight Preprod address and tDUST balance.

4. **[0:45 – 1:00] Select Loan Product**:
   - Browse the **Available Loan Products** marketplace.
   - Highlight public criteria on the *Prime 30-Year Fixed Mortgage*: Min Credit Score: 700+, Min Annual Income: $75,000, Max DTI: 43%.
   - Click **Verify Private Eligibility**.

5. **[1:00 – 1:20] Confidential Borrower Financial Input**:
   - Enter private financial metrics:
     - FICO Score: `740`
     - Gross Annual Income: `$85,000`
     - Monthly Debt Obligations: `$1,200`
   - Point out the live DTI calculation (16.9%) and client-side privacy guarantee: *"🔒 Processed Client-Side Only: Your financial inputs remain strictly in your browser."*

6. **[1:20 – 1:45] Run Eligibility Verification & Prover Stepper**:
   - Click **Generate Zero-Knowledge Eligibility Proof**.
   - Walk through the 4-phase proof stepper in real time:
     1. Initialize Private Witness in local memory sandbox
     2. Evaluate Compact circuit constraints & compute persistent commitment
     3. Synthesize zk-SNARK proof
     4. Broadcast balanced transaction to Midnight Preprod

7. **[1:45 – 2:05] Display Verification Result**:
   - Show the green **Eligible for Loan** certificate.
   - Review the verified rules breakdown (Credit: Passed, Income: Passed, DTI: Passed).
   - Show minimal disclosure receipt: SHA-256 commitment and transaction hash.

8. **[2:05 – 2:20] Privacy Architecture**:
   - Open the **Privacy Architecture** drawer.
   - Explain the 3 tiers:
     - **Private**: Salary, score, and debt remain on-device.
     - **Public**: Loan thresholds and lender address on ledger.
     - **Proved**: Mathematical proof of compliance without raw data exposure.

9. **[2:20 – 2:35] Show Midnight Preprod Contract**:
   - Display the Compact contract source code at `contracts/private-loan-eligibility.compact`.
   - Point out the Preprod contract address: `d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2`.

10. **[2:35 – 2:50] Show GitHub Repository & Passing CI/CD**:
    - Show `https://github.com/omkarjagtap2105-design/PLE`.
    - Show GitHub Actions `.github/workflows/ci.yml` pipeline with green checkmark.
    - Highlight passing test suite (25/25 tests passing).

11. **[2:50 – 3:00] Conclusion**:
    - Wrap up with a strong closing sentence on confidential Web3 lending on Midnight.

---

## 🛠️ RECOMMENDED RECORDING TOOLS

- **Windows**: Xbox Game Bar (`Win + G`) or [OBS Studio](https://obsproject.com/) (Free, open source)
- **Mac**: QuickTime Player (`Cmd + Shift + 5`)
- **Cloud Screen Recorders**: [Loom](https://www.loom.com/) (Free account allows up to 5-minute recordings with instant shareable links)
- **Target Export Format**: MP4, 1080p, 30fps or 60fps, under 25MB (ideal for YouTube or Loom).
