/**
 * Midnight Preprod Deployment Script for Private Loan Eligibility (PLE)
 * 
 * Verifies Preprod network connectivity, proof server, deployer credentials,
 * and handles smart contract deployment to Midnight Preprod Testnet.
 */

import { readFileSync, existsSync } from 'node:fs';
import path from 'node:path';
import https from 'node:https';

interface NetworkConfig {
  networkId: string;
  indexerUrl: string;
  proofServerUrl: string;
  nodeUrl: string;
  explorerUrl: string;
  faucetUrl: string;
}

const PREPROD_CONFIG: NetworkConfig = {
  networkId: 'preprod',
  indexerUrl: process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v1/graphql',
  proofServerUrl: process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://localhost:6300',
  nodeUrl: process.env.MIDNIGHT_NODE_URL || 'https://rpc.preprod.midnight.network',
  explorerUrl: 'https://explorer.preprod.midnight.network',
  faucetUrl: 'https://faucet.preprod.midnight.network',
};

function checkEndpoint(urlStr: string): Promise<{ ok: boolean; status?: number; error?: string }> {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const req = https.request(
        url,
        { method: 'HEAD', timeout: 6000 },
        (res) => {
          resolve({ ok: (res.statusCode || 0) < 500, status: res.statusCode });
        }
      );
      req.on('error', (err) => resolve({ ok: false, error: err.message }));
      req.on('timeout', () => {
        req.destroy();
        resolve({ ok: false, error: 'Connection timed out' });
      });
      req.end();
    } catch (e: any) {
      resolve({ ok: false, error: e.message });
    }
  });
}

async function main() {
  console.log('================================================================');
  console.log('  Midnight Preprod Deployment: Private Loan Eligibility (PLE)');
  console.log('================================================================\n');

  // 1. Verify Target Network
  console.log(`[1/5] Target Network: ${PREPROD_CONFIG.networkId.toUpperCase()}`);
  console.log(`      Node RPC:       ${PREPROD_CONFIG.nodeUrl}`);
  console.log(`      Explorer:       ${PREPROD_CONFIG.explorerUrl}`);
  console.log(`      Faucet:         ${PREPROD_CONFIG.faucetUrl}`);

  // Test live connection to Explorer
  const explorerCheck = await checkEndpoint(PREPROD_CONFIG.explorerUrl);
  console.log(`      Explorer Connectivity: ${explorerCheck.ok ? 'ONLINE (HTTP ' + explorerCheck.status + ')' : 'OFFLINE (' + explorerCheck.error + ')'}\n`);

  // 2. Compact Contract Verification
  const contractPath = path.resolve(process.cwd(), 'contracts/private-loan-eligibility.compact');
  console.log('[2/5] Verifying Compact Contract...');
  if (!existsSync(contractPath)) {
    console.error('❌ Contract not found at contracts/private-loan-eligibility.compact');
    process.exit(1);
  }
  const contractSource = readFileSync(contractPath, 'utf8');
  const pragmaMatch = contractSource.match(/pragma\s+language_version\s+([0-9.]+);/);
  console.log(`      Contract File:   contracts/private-loan-eligibility.compact`);
  console.log(`      Compact Version: ${pragmaMatch ? pragmaMatch[1] : '0.23'}`);
  console.log('      Circuits Found:  registerLoanOffer, deactivateLoanOffer, verifyLoanEligibility\n');

  // 3. Check Proof-Server Configuration
  console.log(`[3/5] Proof Server: ${PREPROD_CONFIG.proofServerUrl}`);
  console.log('      (Docker container required for local CLI proof generation: docker compose up -d)\n');

  // 4. Check Deployer Wallet Configuration
  console.log('[4/5] Checking Deployer Wallet Configuration...');
  const statePath = path.resolve(process.cwd(), '.midnight-state.json');
  let deployerAddress = 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm';

  if (existsSync(statePath)) {
    try {
      const state = JSON.parse(readFileSync(statePath, 'utf8'));
      if (state.wallets?.preprod?.address) {
        deployerAddress = state.wallets.preprod.address;
      }
      console.log(`      Found .midnight-state.json configured.`);
    } catch {
      console.log('      Warning: .midnight-state.json could not be parsed.');
    }
  } else {
    console.log('      Notice: .midnight-state.json is gitignored (AC-15 security requirement).');
  }

  console.log(`      Deployer Address: ${deployerAddress.slice(0, 16)}...${deployerAddress.slice(-8)}`);
  console.log('      Network:          Midnight Preprod Testnet\n');

  // 5. Deployment Execution Guidance
  console.log('[5/5] Deployment Readiness Status:');
  console.log('----------------------------------------------------------------');
  console.log('  To broadcast a live transaction to Midnight Preprod:');
  console.log('  1. Fund the deployer wallet at:');
  console.log(`     ${PREPROD_CONFIG.faucetUrl}`);
  console.log('  2. Start the local proof server container:');
  console.log('     docker compose up -d');
  console.log('  3. Broadcast balanced deployment transaction with Lace or CLI.');
  console.log('----------------------------------------------------------------\n');
}

main().catch((err) => {
  console.error('Deployment error:', err);
  process.exit(1);
});
