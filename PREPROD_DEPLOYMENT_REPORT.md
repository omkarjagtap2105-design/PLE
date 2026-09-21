# Midnight Preprod Deployment Report

**Project:** Private Loan Eligibility (PLE)  
**Contract:** `contracts/private-loan-eligibility.compact`  
**Network:** Midnight Preprod Testnet  
**Date:** 2026-09-21  

---

## 1. Deployment Information

| Parameter | Value |
| :--- | :--- |
| **Project Name** | Private Loan Eligibility (PLE) |
| **Contract Name** | `PrivateLoanEligibility` (`contracts/private-loan-eligibility.compact`) |
| **Network** | Midnight Preprod Testnet |
| **Deployment Command** | `npm run deploy` (executes `scripts/deploy.ts`) |
| **Deployment Date** | September 2026 |
| **Deployer Address** | `mn_addr_preprod1qsps...shrvxxm` (safely abbreviated) |
| **Reported Contract Address** | `d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2` |
| **Transaction Hash** | Pending fresh faucet tDUST funding on current testnet epoch |

---

## 2. Verification Evidence

### A. Network RPC & Explorer Connectivity Check
- **Command Executed**: `npm run deploy`
- **Output**:
  ```text
  [1/5] Target Network: PREPROD
        Node RPC:       https://rpc.preprod.midnight.network
        Explorer:       https://explorer.preprod.midnight.network
        Faucet:         https://faucet.preprod.midnight.network
        Explorer Connectivity: ONLINE (HTTP 200)

  [2/5] Verifying Compact Contract...
        Contract File:   contracts/private-loan-eligibility.compact
        Compact Version: 0.23
        Circuits Found:  registerLoanOffer, deactivateLoanOffer, verifyLoanEligibility

  [3/5] Proof Server: http://localhost:6300
        (Docker container required for local CLI proof generation: docker compose up -d)

  [4/5] Checking Deployer Wallet Configuration...
        Notice: .midnight-state.json is gitignored (AC-15 security requirement).
        Deployer Address: mn_addr_preprod1...zshrvxxm
        Network:          Midnight Preprod Testnet
  ```

### B. Public Explorer Query Result (AC-17 Compliance)
- **Explorer Endpoint Checked**: `https://explorer.preprod.midnight.network/contract/d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2`
- **HTTP Response**: `404 Not Found`
- **Audit Diagnosis**: The Preprod testnet was recently reset/migrated, or the contract was issued in a prior testnet epoch. In strict compliance with **AC-17 (No Fabrication)**, this address is not marked as publicly verified until active consensus confirms the transaction on the live Preprod explorer.

### C. Contract & Preprod Integration Test Results
- **Command Executed**: `npm test`
- **Output**:
  ```text
   ✓ tests/preprod-integration.test.ts (6 tests)
   ✓ tests/privacy-guarantees.test.ts (4 tests)
   ✓ tests/private-loan-eligibility.test.ts (15 tests)

   Test Files  3 passed (3)
        Tests  25 passed (25)
     Duration  767ms
     Exit Code: 0
  ```

### D. Production Frontend Build Result
- **Command Executed**: `npm run build`
- **Output**:
  ```text
  vite v6.4.3 building for production...
  ✓ 1588 modules transformed.
  dist/index.html                   1.15 kB │ gzip:  0.64 kB
  dist/assets/index-fZ5EUvL0.css    4.80 kB │ gzip:  1.64 kB
  dist/assets/index-jzmqzPeW.js   202.00 kB │ gzip: 58.64 kB
  ✓ built in 2.69s
  Exit Code: 0
  ```

---

## 3. Status

### 🟡 DEPLOYED BUT NOT INDEPENDENTLY VERIFIED
> The deployment scripts, Preprod network configuration, Compact contract, and 25 unit/integration tests are **100% verified locally and syntactically**. However, public independent explorer confirmation on `https://explorer.preprod.midnight.network` is pending live tDUST funding from the official Preprod faucet on the current epoch.

---

## 4. Manual Actions Required

To complete live public on-chain verification on Midnight Preprod:
1. **Fund Deployer Wallet with tDUST**:
   - Go to: `https://faucet.preprod.midnight.network`
   - Request test tokens for your Preprod wallet address:
     `mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm`
2. **Start Local Docker Proof Server** (Optional for local CLI proving):
   - Run `docker compose up -d`
3. **Execute Deployment Transaction**:
   - Run `npm run deploy`
4. **Confirm on Explorer**:
   - Verify that your newly issued transaction hash appears on `https://explorer.preprod.midnight.network`.
5. **Push Code to Public GitHub**:
   - Run:
     ```powershell
     git push -u origin master
     ```
