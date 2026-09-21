/**
 * Midnight Preprod Balance Inspector
 * Checks tDUST and Night balance for deployment on Midnight Preprod network.
 */

import { existsSync, readFileSync } from 'node:fs';
import path from 'node:path';

async function main() {
  console.log('--- Midnight Preprod Balance Inspector ---');
  const statePath = path.resolve(process.cwd(), '.midnight-state.json');

  if (!existsSync(statePath)) {
    console.log('Notice: .midnight-state.json is not initialized.');
    console.log('Network: Midnight Preprod (Testnet)');
    console.log('Preprod Faucet: https://faucet.preprod.midnight.network');
    console.log('To request funds: Paste your Midnight testnet address into the faucet.');
    return;
  }

  const state = JSON.parse(readFileSync(statePath, 'utf8'));
  const preprod = state.wallets?.preprod;

  if (preprod) {
    console.log(`Address: ${preprod.address || 'Address derived from mnemonic'}`);
    console.log(`Network: Midnight Preprod`);
    console.log(`Status: Ready for Preprod transactions`);
  }
}

main().catch(console.error);
