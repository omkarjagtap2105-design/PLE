import { createHash } from 'node:crypto';
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
import { Buffer } from 'node:buffer';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const PREPROD_CONFIG = {
  networkId: 'preprod' as const,
  indexer: 'https://indexer.preprod.midnight.network/api/v3/graphql',
  indexerWS: 'wss://indexer.preprod.midnight.network/api/v3/graphql/ws',
  node: 'https://rpc.preprod.midnight.network',
  proofServer: 'http://127.0.0.1:6300',
  faucet: 'https://faucet.preprod.midnight.network',
  explorerUrl: 'https://explorer.preprod.midnight.network',
};

const CONTRACT_NAME = 'private-loan-eligibility';
const ZK_CONFIG_PATH = path.join(projectRoot, 'contracts', 'managed', CONTRACT_NAME);
const CONTRACT_PATH = path.join(ZK_CONFIG_PATH, 'contract', 'index.js');
const STATE_PATH = path.join(projectRoot, '.midnight-state.json');
const PRIVATE_STATE_ID = 'ple-private-state';

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

function delay(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

async function waitForProofServer(maxAttempts = 60, delayMs = 2000): Promise<boolean> {
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3000);
      await fetch(PREPROD_CONFIG.proofServer, { method: 'GET', signal: controller.signal as any });
      clearTimeout(timeout);
      return true;
    } catch {
      // ignore connection errors
    }
    if (attempt < maxAttempts) {
      process.stdout.write(`\r  Waiting for proof server... (${attempt}/${maxAttempts})   `);
      await delay(delayMs);
    }
  }
  return false;
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

  // 2. Load or create wallet
  console.log('\n[2/6] Checking deployer wallet configuration...');

  let seedHex: string;
  let mnemonic: string | undefined;

  if (fs.existsSync(STATE_PATH)) {
    const state = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
    const wallet = state.wallets?.preprod;
    if (wallet?.seed) {
      seedHex = wallet.seed;
      mnemonic = wallet.mnemonic;
      console.log('  ✓ Loaded wallet from .midnight-state.json');
    } else {
      console.error('  ❌ No seed found in .midnight-state.json');
      process.exit(1);
    }
  } else {
    console.log('  ⚠️  .midnight-state.json not found.');
    console.log('  MANUAL ACTION REQUIRED:');
    console.log(`    1. Request tDUST from: ${PREPROD_CONFIG.faucet}`);
    console.log('    2. Set MIDNIGHT_WALLET_MNEMONIC environment variable');
    console.log('       OR create .midnight-state.json with wallet seed.');
    console.log('\n  Deployment will proceed once wallet is configured.');
    process.exit(1);
  }

  // Dynamic import of the modular Midnight wallet SDK
  console.log('\n[3/6] Loading Midnight wallet SDK...');

  const {
    HDWallet,
    Roles,
    WalletFacade,
    ShieldedWallet,
    UnshieldedWallet,
    DustWallet,
    createKeystore,
    InMemoryTransactionHistoryStorage,
    PublicKey,
    TransactionHistoryStorage,
  } = await import('@midnight-ntwrk/wallet-sdk');

  const ledger = await import('@midnight-ntwrk/midnight-js-protocol/ledger');
  const { setNetworkId } = await import('@midnight-ntwrk/midnight-js-network-id');

  const networkId = 'preprod' as const;

  // Midnight.js uses the global network ID for contract operations.
  setNetworkId(networkId);

  // Derive the three wallet roles from the stored deployment seed.
  console.log('  Deriving wallet keys...');

  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));

  if (hdWallet.type !== 'seedOk') {
    throw new Error('Invalid Midnight wallet seed');
  }

  const derivationResult = hdWallet.hdWallet
    .selectAccount(0)
    .selectRoles([
      Roles.Zswap,
      Roles.NightExternal,
      Roles.Dust,
    ])
    .deriveKeysAt(0);

  if (derivationResult.type !== 'keysDerived') {
    throw new Error('Midnight wallet key derivation failed');
  }

  const keys = derivationResult.keys;
  hdWallet.hdWallet.clear();

  const shieldedSecretKeys =
    ledger.ZswapSecretKeys.fromSeed(keys[Roles.Zswap]);

  const dustSecretKey =
    ledger.DustSecretKey.fromSeed(keys[Roles.Dust]);

  const unshieldedKeystore =
    createKeystore(
      keys[Roles.NightExternal],
      networkId
    );

  const address = unshieldedKeystore.getBech32Address();

  console.log(`  Wallet Address: ${address.toString()}`);

  const indexerClientConnection = {
    indexerHttpUrl: PREPROD_CONFIG.indexer,
    indexerWsUrl: PREPROD_CONFIG.indexerWS,
  };

  const transactionHistoryStorage =
    new InMemoryTransactionHistoryStorage(
      TransactionHistoryStorage.TransactionHistoryCommonSchema
    );

  // Shielded wallet configuration.
  const shieldedConfig = {
    networkId,
    indexerClientConnection,
    provingServerUrl: new URL(PREPROD_CONFIG.proofServer),
    relayURL: new URL(
      PREPROD_CONFIG.node.replace(/^http/, 'ws')
    ),
    txHistoryStorage: transactionHistoryStorage,
  };

  // Unshielded wallet configuration.
  const unshieldedConfig = {
    networkId,
    indexerClientConnection,
    txHistoryStorage: transactionHistoryStorage,
  };

  // DUST wallet configuration.
  //
  // Preprod is a remote network. The current Midnight
  // example-bboard configuration uses a small additional
  // overhead for remote networks.
  const dustConfig = {
    networkId,
    costParameters: {
      additionalFeeOverhead: 1_000n,
      feeBlocksMargin: 5,
    },
    indexerClientConnection,
    provingServerUrl: new URL(PREPROD_CONFIG.proofServer),
    relayURL: new URL(
      PREPROD_CONFIG.node.replace(/^http/, 'ws')
    ),
    txHistoryStorage: transactionHistoryStorage,
  };

  console.log('  Initializing shielded wallet...');
  const shieldedWallet =
    ShieldedWallet(shieldedConfig)
      .startWithSecretKeys(shieldedSecretKeys);

  console.log('  Initializing unshielded wallet...');
  const unshieldedWallet =
    UnshieldedWallet(unshieldedConfig)
      .startWithPublicKey(
        PublicKey.fromKeyStore(unshieldedKeystore)
      );

  console.log('  Initializing DUST wallet...');
  const dustWallet =
    DustWallet(dustConfig)
      .startWithSecretKey(
        dustSecretKey,
        ledger.LedgerParameters.initialParameters().dust
      );

  console.log('  Initializing wallet facade...');

  const wallet = await WalletFacade.init({
    configuration: {
      networkId,
      indexerClientConnection,
      txHistoryStorage: transactionHistoryStorage,
      costParameters: {
        additionalFeeOverhead: 1_000n,
        feeBlocksMargin: 5,
      },
      relayURL: new URL(
        PREPROD_CONFIG.node.replace(/^http/, 'ws')
      ),
    },

    shielded: () => shieldedWallet,

    unshielded: () => unshieldedWallet,

    dust: () => dustWallet,
  });

  // Wait for sync
  console.log('  Syncing with network...');
  const syncStart = Date.now();
  const syncInterval = setInterval(() => {
    const elapsed = Math.round((Date.now() - syncStart) / 1000);
    process.stdout.write(`\r  ⏳ Still syncing... (${elapsed}s elapsed)   `);
  }, 5000);
  await wallet.waitForSyncedState();
  clearInterval(syncInterval);
  process.stdout.write('\r  ✓ Synced with network.                                      \n');

  // Check balance
  const syncState = await wallet.waitForSyncedState();
  let balance = syncState.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
  console.log(`  Balance: ${balance.toLocaleString()} tNIGHT`);
  console.log(`  Balance token: ${ledger.unshieldedToken().raw}`);

  // Wait for funding if zero
  if (balance === 0n) {
    console.log(`\n  Wallet address: ${address.toString()}`);
    console.log(`  Faucet: ${PREPROD_CONFIG.faucet}`);
    console.log('  Waiting for tNIGHT to arrive (poll every 10s)...');
    
    const start = Date.now();
    while (true) {
      await delay(10000);
      const s = await wallet.waitForSyncedState();
      balance = s.unshielded.balances[ledger.unshieldedToken().raw] ?? 0n;
      if (balance > 0n) {
        console.log(`\n  Funded! tNIGHT balance: ${balance.toLocaleString()}\n`);
        break;
      }
      const elapsed = Math.round((Date.now() - start) / 1000);
      process.stdout.write(`\r  ...still waiting (${elapsed}s elapsed)`);
      if (elapsed > 600) {
        console.log('\n  ❌ Funding not received within 10 min.');
        await wallet.stop();
        process.exit(1);
      }
    }
  }

  // Register for DUST
  console.log('\n[4/6] Setting up DUST...');
  const dustState = await wallet.waitForSyncedState();
  const unregisteredUtxos = dustState.unshielded.availableCoins.filter(
    (c: any) => !c.meta?.registeredForDustGeneration
  );
  if (unregisteredUtxos.length > 0) {
    console.log(`  Registering ${unregisteredUtxos.length} NIGHT UTXOs for DUST generation...`);
    const recipe = await wallet.registerNightUtxosForDustGeneration(
      unregisteredUtxos,
      unshieldedKeystore.getPublicKey(),
      (payload: any) => unshieldedKeystore.signData(payload)
    );
    const finalized = await wallet.finalizeRecipe(recipe);
    await wallet.submitTransaction(finalized);
  }

  // Wait for DUST
  if (dustState.dust.balance(new Date()) === 0n) {
    console.log('  Waiting for DUST tokens...');
    await new Promise((resolve) => {
      const check = async () => {
        const s = await wallet.waitForSyncedState();
        if (s.dust.balance(new Date()) > 0n) {
          resolve(undefined);
        } else {
          setTimeout(check, 5000);
        }
      };
      check();
    });
  }
  console.log('  DUST tokens ready!\n');

  // Check proof server
  console.log('[5/6] Checking proof server...');
  const proofServerReady = await waitForProofServer();
  if (!proofServerReady) {
    console.log('\n  ❌ Proof server not responding. Run: docker compose up -d\n');
    await wallet.stop();
    process.exit(1);
  }
  process.stdout.write('\r  Proof server ready!                                 \n');

  // Setup providers
  console.log('  Setting up providers...');
  const { deployContract } = await import('@midnight-ntwrk/midnight-js-contracts');
  const { CompiledContract } = await import('@midnight-ntwrk/midnight-js-protocol/compact-js');
  const { httpClientProofProvider } = await import('@midnight-ntwrk/midnight-js-http-client-proof-provider');
  const { indexerPublicDataProvider } = await import('@midnight-ntwrk/midnight-js-indexer-public-data-provider');
  const { levelPrivateStateProvider } = await import('@midnight-ntwrk/midnight-js-level-private-state-provider');
  const { NodeZkConfigProvider } = await import('@midnight-ntwrk/midnight-js-node-zk-config-provider');

  const zkConfigProvider = new NodeZkConfigProvider(ZK_CONFIG_PATH);
  const accountId = unshieldedKeystore.getBech32Address().toString();

  const providers = {
    privateStateProvider: levelPrivateStateProvider({
      privateStateStoreName: CONTRACT_NAME,
      accountId,
      privateStoragePasswordProvider: () => 'Local-Devnet-Development-Placeholder-1',
    }),
    publicDataProvider: indexerPublicDataProvider(PREPROD_CONFIG.indexer, PREPROD_CONFIG.indexerWS),
    zkConfigProvider,
    proofProvider: httpClientProofProvider(PREPROD_CONFIG.proofServer, zkConfigProvider),
    walletProvider: {
      getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
      getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
      async balanceTx(tx: any, ttl?: Date) {
        const recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
        );
        return wallet.finalizeRecipe(recipe);
      },
      submitTx: (tx: any) => wallet.submitTransaction(tx),
    },
    midnightProvider: {
      getCoinPublicKey: () => shieldedSecretKeys.coinPublicKey,
      getEncryptionPublicKey: () => shieldedSecretKeys.encryptionPublicKey,
      async balanceTx(tx: any, ttl?: Date) {
        const recipe = await wallet.balanceUnboundTransaction(
          tx,
          { shieldedSecretKeys, dustSecretKey },
          { ttl: ttl ?? new Date(Date.now() + 30 * 60 * 1000) }
        );
        return wallet.finalizeRecipe(recipe);
      },
      submitTx: (tx: any) => wallet.submitTransaction(tx),
    },
  };

  // Load compiled contract
  console.log('  Loading compiled contract...');
  const ContractModule = await import(CONTRACT_PATH);
  const compiledContract = CompiledContract.make(CONTRACT_NAME, ContractModule.Contract).pipe(
    CompiledContract.withCompiledFileAssets(ZK_CONFIG_PATH)
  );

  // Deploy
  console.log('\n[6/6] Deploying to Midnight Preprod...');
  console.log(`  Contract: ${CONTRACT_NAME}`);
  console.log(`  Admin: ${address.toString().slice(0, 16)}...${address.toString().slice(-8)}`);
  console.log('  This may take a few minutes...\n');

  const MAX_RETRIES = 20;
  const RETRY_DELAY_MS = 5000;
  let deployed: any;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Compact constructor requires exactly Bytes<32>.
      // The contract stores admin only as a public identifier, so derive
      // a deterministic 32-byte identifier from the deployment wallet address.
      const adminId = createHash('sha256')
        .update(address.toString(), 'utf8')
        .digest();

      deployed = await deployContract(providers as any, {
        compiledContract: compiledContract as any,
        args: [adminId],
        privateStateId: PRIVATE_STATE_ID,
        initialPrivateState: {},
      });
      break;
    } catch (err: any) {
      const errMsg = err?.message || err?.toString() || '';
      const errCause = err?.cause?.message || err?.cause?.toString() || '';
      const fullError = `${errMsg} ${errCause}`;

      const isDustShortage =
        fullError.includes('Not enough Dust') ||
        fullError.includes('Insufficient Funds') ||
        fullError.includes('could not balance dust');

      if (!(isDustShortage && attempt === 1)) {
        console.error(`\n  Attempt ${attempt} error: ${errMsg}`);
        if (errCause && errCause !== errMsg) console.error(`  Cause: ${errCause}`);
      }

      if (
        !isDustShortage &&
        (fullError.includes('Failed to connect to Proof Server') ||
          fullError.includes('connect ECONNREFUSED 127.0.0.1:6300'))
      ) {
        console.log('  ❌ Proof server unreachable. Run: docker compose up -d\n');
        await wallet.stop();
        process.exit(1);
      }

      if (isDustShortage) {
        const currentState = await wallet.waitForSyncedState();
        const dustBalance = currentState.dust.balance(new Date());
        if (attempt < MAX_RETRIES) {
          if (attempt === 1) {
            console.log(`  Still generating DUST, retrying in ${RETRY_DELAY_MS / 1000}s...`);
          } else {
            console.log(`  ⏳ DUST balance: ${dustBalance.toLocaleString()} (attempt ${attempt}/${MAX_RETRIES}); retrying in ${RETRY_DELAY_MS / 1000}s...`);
          }
          await delay(RETRY_DELAY_MS);
        } else {
          console.log(`  ❌ Not enough DUST after ${MAX_RETRIES} retries (current: ${dustBalance.toLocaleString()})`);
          await wallet.stop();
          process.exit(1);
        }
      } else {
        throw err;
      }
    }
  }

  if (!deployed) {
    console.error('\n❌ Deployment failed after all retries');
    await wallet.stop();
    process.exit(1);
  }

  const contractAddress = deployed.deployTxData.public.contractAddress;
  console.log('\n  ✅ Contract deployed successfully!');
  console.log(`\n  Contract Address: ${contractAddress}\n`);
  console.log(`  Explorer: ${PREPROD_CONFIG.explorerUrl}/address/${contractAddress}`);

  // Save deployment
  const existingState = JSON.parse(fs.readFileSync(STATE_PATH, 'utf8'));
  existingState.deployments = existingState.deployments || {};
  existingState.deployments[PREPROD_CONFIG.networkId] = {
    address: contractAddress,
    deployer: address.toString(),
    deployedAt: new Date().toISOString(),
  };
  fs.writeFileSync(STATE_PATH, JSON.stringify(existingState, null, 2) + '\n');
  console.log('  Saved to .midnight-state.json\n');

  await wallet.stop();
  console.log('─── Deployment complete ────────────────────────────────────────\n');
}

main().catch((err) => {
  console.error('\nDeployment error:', err);
  process.exit(1);
});
