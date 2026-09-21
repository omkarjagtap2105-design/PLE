# Midnight Preprod Deployment Audit

**Project:** Private Loan Eligibility (PLE)  
**Date:** 2026-09-21  
**Target Network:** Midnight Preprod Testnet  
**Repository:** `https://github.com/omkarjagtap2105-design/PLE`

---

## 1. Current Deployment Status
- **Status**: 🟡 **DEPLOYED LOCALLY / TESTNET PREPARED — AWAITING ACTIVE PREPROD VERIFICATION**
- **Compact Contract**: `contracts/private-loan-eligibility.compact` (Valid Compact 0.23 syntax, verified via Midnight MCP compiler analysis).
- **Test Suite**: 19/19 tests passing (`npm test`), validating all underwriting rules and privacy guarantees in-memory.
- **Frontend**: Production bundle verified (`npm run build`), with Lace Wallet DApp connector integration.

---

## 2. Current Network Configuration
- **Network ID**: `preprod` (Midnight Preprod Testnet)
- **RPC / Node URL**: `https://rpc.preprod.midnight.network`
- **Explorer URL**: `https://explorer.preprod.midnight.network`
- **Indexer GraphQL Endpoint**: `https://indexer.preprod.midnight.network/api/v1/graphql`
- **Proof Server URL**: `http://localhost:6300` (via Docker `docker-compose.yml`)
- **Faucet URL**: `https://faucet.preprod.midnight.network`

---

## 3. Current Deployer Address
- **Deployer Wallet Address**: `mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm`
- **Wallet State File**: `.midnight-state.json` (gitignored in accordance with AC-15 to protect seed credentials).
- **Preprod Funds**: tDUST test tokens required for on-chain state registration transaction fees.

---

## 4. Current Contract Address
- **Contract Name**: Private Loan Eligibility (`private-loan-eligibility.compact`)
- **Reported Address**: `d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2`
- **Public Explorer Verification**:
  - Live query to `https://explorer.preprod.midnight.network/contract/d32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2` returned HTTP 404 (due to testnet indexer reset / new deployment required).
  - In strict compliance with **AC-17 (No Fabrication)**, this address cannot be reported as independently verified until active on-chain consensus is recorded on the current Preprod epoch.

---

## 5. Current Identified Problems & Limitations
1. **Docker Proof-Server**: Docker Desktop daemon is not running on the local Windows system (`docker DesktopLinuxEngine not connected`), which prevents running local proof generation during CLI deployment without an active proof server.
2. **Compact Compiler CLI**: The standalone `compact` binary is not in Windows system path (Windows `compact.exe` is the NTFS compression tool). Contract syntax is verified via Midnight MCP analysis.
3. **Indexer Endpoint**: Direct GraphQL queries to `/api/v1/graphql` returned 308 redirect; explorer interface at `https://explorer.preprod.midnight.network` is the primary public verification interface.

---

## 6. Required Manual Actions
1. **Fund Deployer Wallet**: Ensure `mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm` has tDUST from `https://faucet.preprod.midnight.network`.
2. **Start Proof-Server**: Launch Docker Desktop and run `docker compose up -d` to start the Midnight proof-server on port 6300.
3. **Broadcast Deployment Transaction**: Execute `npm run deploy` to broadcast the transaction to Preprod.
4. **Confirm on Explorer**: Verify the newly generated transaction hash and contract address on `https://explorer.preprod.midnight.network`.

---

## 7. Planned Deployment Steps
1. Create `.env.example` with exact Preprod network parameters.
2. Refine `scripts/deploy.ts` and `scripts/check-balance.ts` to provide clear diagnostics, network status, and step-by-step guidance.
3. Add a dedicated integration test `tests/preprod-contract.test.ts` to test Preprod configuration, contract parameters, and address format validation.
4. Execute `npm test`, `npm run build`, and `npm run audit`.
5. Produce `PREPROD_DEPLOYMENT_REPORT.md` with honest, un-fabricated status.
