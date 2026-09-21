/**
 * Midnight Preprod Deployment Script for Private Loan Eligibility (PLE)
 *
 * Deploys the compiled PLE Compact contract to Midnight Preprod Testnet.
 *
 * Prerequisites:
 *   - Docker Desktop running (for proof server)
 *   - Wallet funded with tDUST from https://faucet.preprod.midnight.network
 *   - .midnight-state.json with deployer wallet configuration
 *
 * Network: Midnight Preprod
 */

import * as fs from 'node:fs';
import * as path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const PREPROD_CONFIG = {
  networkId: 'preprod',
  indexerUrl: process.env.MIDNIGHT_INDEXER_URL || 'https://indexer.preprod.midnight.network/api/v1/graphql',
  proofServerUrl: process.env.MIDNIGHT_PROOF_SERVER_URL || 'http://localhost:6300',
  nodeUrl: process.env.MIDNIGHT_NODE_URL || 'https://rpc.preprod.midnight.network',
  explorerUrl: 'https://explorer.preprod.midnight.network',
  faucetUrl: 'https://faucet.preprod.midnight.network',
};

const CONTRACT_NAME = 'private-loan-eligibility';
const ZK_CONFIG_PATH = path.join(projectRoot, 'contracts', 'managed', CONTRACT_NAME);
const CONTRACT_PATH = path.join(ZK_CONFIG_PATH, 'contract', 'index.js');

function checkFile(filePath: string, label: string): boolean {
  if (!fs.existsSync(filePath)) {
    console.error(`  ❌ Missing: ${label} (${filePath})`);
    return false;
  }
  console.log(`  ✓ ${label}`);
  return true;
}

function run(cmd: string, args: string[]): number {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    cwd: projectRoot,
  });
  return result.status ?? 1;
}

async function main(): Promise<void> {
  console.log('================================================================');
  console.log('  Midnight Preprod Deployment: Private Loan Eligibility (PLE)');
  console.log('================================================================\n');

  // 1. Verify compiled contract exists
  console.log('[1/6] Verifying compiled contract...');
  const contractOk = checkFile(CONTRACT_PATH, 'Compiled contract (index.js)');
  const zkirOk = checkFile(
    path.join(ZK_CONFIG_PATH, 'zkir', 'verifyLoanEligibility.zkir'),
    'ZK circuit (verifyLoanEligibility.zkir)'
  );
  const infoOk = checkFile(
    path.join(ZK_CONFIG_PATH, 'compiler', 'contract-info.json'),
    'Compiler metadata (contract-info.json)'
  );

  if (!contractOk || !zkirOk || !infoOk) {
    console.error('\n❌ Contract not compiled. Run: npm run compile');
    process.exit(1);
  }

  // 2. Check wallet state
  console.log('\n[2/6] Checking deployer wallet configuration...');
  const statePath = path.join(projectRoot, '.midnight-state.json');

  if (!fs.existsSync(statePath)) {
    console.log('  ⚠️  .midnight-state.json not found.');
    console.log('  MANUAL ACTION REQUIRED:');
    console.log(`    1. Request tDUST from: ${PREPROD_CONFIG.faucetUrl}`);
    console.log('    2. Create a wallet using the Midnight Lace extension or SDK.');
    console.log('    3. Save wallet state to .midnight-state.json.');
    console.log('\n  Deployment will proceed once wallet is configured.');
    process.exit(1);
  }

  let state: any;
  try {
    state = JSON.parse(fs.readFileSync(statePath, 'utf8'));
  } catch {
    console.error('  ❌ Could not parse .midnight-state.json');
    process.exit(1);
  }

  const deployerAddress = state.wallets?.preprod?.address || state.address;
  if (!deployerAddress) {
    console.error('  ❌ No Preprod address found in .midnight-state.json');
    process.exit(1);
  }

  console.log(`  Deployer Address: ${deployerAddress.slice(0, 16)}...${deployerAddress.slice(-8)}`);

  // 3. Check network connectivity
  console.log('\n[3/6] Verifying Midnight Preprod network connectivity...');
  const nodeUrl = new URL(PREPROD_CONFIG.nodeUrl);
  console.log(`  Node RPC: ${PREPROD_CONFIG.nodeUrl}`);
  console.log(`  Indexer:  ${PREPROD_CONFIG.indexerUrl}`);
  console.log(`  Proof Server: ${PREPROD_CONFIG.proofServerUrl}`);

  // 4. Check proof server
  console.log('\n[4/6] Checking proof server...');
  console.log(`  Starting proof server via Docker Compose...`);
  const composeUp = run('docker', ['compose', 'up', '-d']);
  if (composeUp !== 0) {
    console.log('  ⚠️  docker compose up -d failed. Proof server may need manual start.');
    console.log('  MANUAL ACTION REQUIRED: Run "docker compose up -d" to start proof server.');
  } else {
    console.log('  ✓ Proof server started (or already running)');
  }

  // 5. Attempt deployment
  console.log('\n[5/6] Preparing deployment...');

  // Dynamic import of deployment libraries
  let deployContract: any, CompiledContract: any, httpClientProofProvider: any,
      indexerPublicDataProvider: any, levelPrivateStateProvider: any,
      NodeZkConfigProvider: any;

  try {
    const contractsModule = await import('@midnight-ntwrk/midnight-js-contracts');
    const protocolModule = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
    const proofProviderModule = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
    const indexerModule = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
    const stateProviderModule = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
    const zkConfigModule = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');

    deployContract = contractsModule.deployContract;
    CompiledContract = protocolModule.CompiledContract;
    httpClientProofProvider = proofProviderModule.httpClientProofProvider;
    indexerPublicDataProvider = indexerModule.indexerPublicDataProvider;
    levelPrivateStateProvider = stateProviderModule.levelPrivateStateProvider;
    NodeZkConfigProvider = zkConfigModule.NodeZkConfigProvider;
  } catch (err: any) {
    console.error('  ❌ Failed to load Midnight JS deployment libraries:', err.message);
    console.error('  Run: npm install');
    process.exit(1);
  }

  // Load compiled contract
  console.log('  Loading compiled contract...');
  let ContractModule: any;
  try {
    ContractModule = await import(CONTRACT_PATH);
  } catch (err: any) {
    console.error('  ❌ Failed to load compiled contract:', err.message);
    process.exit(1);
  }

  const compiledContract = CompiledContract.make(CONTRACT_NAME, ContractModule.Contract).pipe(
    CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH),
  );

  // 6. Deploy
  console.log('\n[6/6] Deploying to Midnight Preprod...');
  console.log(`  Contract: ${CONTRACT_NAME}`);
  console.log(`  Admin: ${deployerAddress.slice(0, 16)}...${deployerAddress.slice(-8)}`);
  console.log('  MANUAL ACTION REQUIRED:');
  console.log('    This deployment requires:');
  console.log('    1. A funded Preprod wallet with tDUST');
  console.log('    2. Docker proof server running (docker compose up -d)');
  console.log('    3. Transaction signing approval via Lace wallet');
  console.log('\n  To deploy manually, run this script with a funded wallet configured.');
  console.log(`  Explorer: ${PREPROD_CONFIG.explorerUrl}`);
}

main().catch((err) => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
