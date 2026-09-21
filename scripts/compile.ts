/**
 * Compile the PLE Compact contract using compactc v0.31.1 (Linux binary in Docker Alpine).
 *
 * On Windows the compactc binary is not available natively, so this script
 * downloads and runs the official compactc v0.31.1 Linux binary in a lightweight
 * Alpine Docker container.
 *
 * Requires:
 *   - Docker Desktop running
 *   - Network access to download compactc binary from GitHub releases
 *
 * Output:
 *   contracts/managed/private-loan-eligibility/
 */

import { spawnSync } from 'node:child_process';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const projectRoot = path.resolve(__dirname, '..');

const COMPACT_IMAGE = 'alpine:latest';
const COMPACT_BIN_DIR = path.join(process.env.LOCALAPPDATA || '', 'Temp', 'kilo', 'compactc-v0.31.1');
const COMPACT_BIN = path.join(COMPACT_BIN_DIR, 'compactc.bin');
const CONTRACT_SOURCE = path.join(projectRoot, 'contracts', 'private-loan-eligibility.compact');
const OUTPUT_DIR = path.join(projectRoot, 'contracts', 'managed', 'private-loan-eligibility');

function run(cmd: string, args: string[]): number {
  const result = spawnSync(cmd, args, {
    stdio: 'inherit',
    shell: false,
    cwd: projectRoot,
  });
  return result.status ?? 1;
}

function downloadCompactc(): void {
  if (existsSync(COMPACT_BIN)) {
    console.log(`  compactc v0.31.1 binary already present at: ${COMPACT_BIN_DIR}`);
    return;
  }

  console.log('  Downloading compactc v0.31.1 from GitHub releases...');
  const zipUrl = 'https://github.com/midnightntwrk/compact/releases/download/compactc-v0.31.1/compactc_v0.31.1_x86_64-unknown-linux-musl.zip';
  const zipPath = path.join(COMPACT_BIN_DIR, 'compactc-v0.31.1.zip');

  // Ensure directory exists
  const { mkdirSync } = require('node:fs');
  mkdirSync(COMPACT_BIN_DIR, { recursive: true });

  const downloadResult = spawnSync(
    process.execPath,
    ['-e', `require('https').get('${zipUrl}', (res) => { const f = require('fs').createWriteStream('${zipPath.replace(/\\/g, '\\\\')}'); res.pipe(f); f.on('finish', () => f.close()); }).on('error', (e) => { console.error(e); process.exit(1); });`],
    { stdio: 'inherit', cwd: projectRoot }
  );

  if (downloadResult.status !== 0 || !existsSync(zipPath)) {
    console.warn('  Warning: Could not download compactc automatically.');
    console.warn(`  Please manually download from: ${zipUrl}`);
    console.warn(`  Extract to: ${COMPACT_BIN_DIR}`);
    return;
  }

  // Extract zip
  const extractResult = run('powershell', [
    '-Command',
    `Expand-Archive -Path "${zipPath}" -DestinationPath "${COMPACT_BIN_DIR}" -Force`,
  ]);

  if (extractResult !== 0) {
    console.warn('  Warning: Could not extract compactc automatically.');
    return;
  }

  console.log('  compactc v0.31.1 downloaded and extracted successfully.');
}

async function main(): Promise<void> {
  console.log('Compiling PLE Compact contract with compactc v0.31.1...\n');

  // 1. Download compactc if needed
  console.log('[1/4] Checking compactc compiler...');
  downloadCompactc();

  if (!existsSync(COMPACT_BIN)) {
    console.error(`\ncompactc binary not found at: ${COMPACT_BIN}`);
    console.error('Please download it manually from:');
    console.error('  https://github.com/midnightntwrk/compact/releases/tag/compactc-v0.31.1');
    console.error(`And extract to: ${COMPACT_BIN_DIR}`);
    process.exit(1);
  }

  // 2. Pull Docker Alpine image
  console.log('\n[2/4] Ensuring Docker Alpine image is available...');
  const pullResult = run('docker', ['pull', COMPACT_IMAGE]);
  if (pullResult !== 0) {
    console.error(`\nFailed to pull Docker image ${COMPACT_IMAGE}`);
    console.error('Ensure Docker Desktop is running and you have network access.');
    process.exit(pullResult);
  }

  // 3. Compile contract
  console.log('\n[3/4] Compiling contract...');
  const compileResult = run('docker', [
    'run',
    '--rm',
    '-v',
    `${projectRoot}:/project`,
    '-v',
    `${COMPACT_BIN_DIR}:/compactc`,
    COMPACT_IMAGE,
    '/compactc/compactc.bin',
    '--skip-zk',
    '/project/contracts/private-loan-eligibility.compact',
    '/project/contracts/managed/private-loan-eligibility',
  ]);

  if (compileResult !== 0) {
    console.error('\nCompilation failed. See errors above.');
    process.exit(compileResult);
  }

  // 4. Verify output
  console.log('\n[4/4] Verifying managed artifacts...');
  const requiredFiles = [
    path.join(OUTPUT_DIR, 'contract', 'index.js'),
    path.join(OUTPUT_DIR, 'contract', 'index.d.ts'),
    path.join(OUTPUT_DIR, 'zkir', 'registerLoanOffer.zkir'),
    path.join(OUTPUT_DIR, 'zkir', 'deactivateLoanOffer.zkir'),
    path.join(OUTPUT_DIR, 'zkir', 'verifyLoanEligibility.zkir'),
    path.join(OUTPUT_DIR, 'compiler', 'contract-info.json'),
  ];

  let allPresent = true;
  for (const file of requiredFiles) {
    if (!existsSync(file)) {
      console.error(`  Missing: ${path.relative(projectRoot, file)}`);
      allPresent = false;
    } else {
      console.log(`  ✓ ${path.relative(projectRoot, file)}`);
    }
  }

  if (!allPresent) {
    console.error('\nSome managed artifacts are missing.');
    process.exit(1);
  }

  console.log('\n✅ Contract compiled successfully with compactc v0.31.1!');
  console.log(`   Source:  ${path.relative(projectRoot, CONTRACT_SOURCE)}`);
  console.log(`   Output:  ${path.relative(projectRoot, OUTPUT_DIR)}`);
}

main().catch((err) => {
  console.error('Compile error:', err);
  process.exit(1);
});
