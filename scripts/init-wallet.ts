import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

async function main() {
  const projectRoot = path.resolve(process.cwd());
  const statePath = path.join(projectRoot, '.midnight-state.json');

  if (existsSync(statePath)) {
    console.log('⚠️  .midnight-state.json already exists.');
    console.log('Refusing to overwrite the existing deployment wallet.');
    process.exit(1);
  }

  const {
    HDWallet,
    Roles,
    generateRandomSeed,
    createKeystore,
  } = await import('@midnight-ntwrk/wallet-sdk');

  const seedBytes = generateRandomSeed();
  const seedHex = Buffer.from(seedBytes).toString('hex');

  const hdWallet = HDWallet.fromSeed(Buffer.from(seedHex, 'hex'));

  if (hdWallet.type !== 'seedOk') {
    throw new Error('Failed to initialize HD wallet from generated seed');
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
    throw new Error('Failed to derive wallet keys');
  }

  const keys = derivationResult.keys;
  hdWallet.hdWallet.clear();

  const unshieldedKeystore = createKeystore(
    keys[Roles.NightExternal],
    'preprod'
  );

  const address = unshieldedKeystore.getBech32Address().toString();

  const state = {
    wallets: {
      preprod: {
        seed: seedHex,
        address,
      },
    },
  };

  writeFileSync(
    statePath,
    JSON.stringify(state, null, 2) + '\n',
    { mode: 0o600 }
  );

  console.log('');
  console.log('============================================================');
  console.log('  Midnight Preprod Deployment Wallet Created');
  console.log('============================================================');
  console.log('');
  console.log(`Network:  Preprod`);
  console.log(`Address:  ${address}`);
  console.log('');
  console.log('IMPORTANT: The wallet seed was saved locally in:');
  console.log('  .midnight-state.json');
  console.log('');
  console.log('DO NOT commit this file.');
  console.log('DO NOT send the seed/mnemonic to anyone.');
  console.log('');
  console.log('Next step: fund the address above with Preprod tNIGHT.');
  console.log('Faucet: https://faucet.preprod.midnight.network');
  console.log('');
}

main().catch((error) => {
  console.error('');
  console.error('❌ Wallet initialization failed:');
  console.error(error);
  process.exit(1);
});
