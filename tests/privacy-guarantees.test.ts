import { describe, it, expect } from 'vitest';
import {
  PrivateLoanEligibilityContract,
  BorrowerPrivateWitness,
  persistentCommit,
} from '../src/contract-sim.js';

describe('Privacy Behavior & Minimal Necessary Disclosure (AC-03 & AC-05)', () => {
  const contract = new PrivateLoanEligibilityContract('admin_privacy_test');
  const loanId = 'loan_confidential_auto';
  contract.registerLoanOffer(loanId, 700, 60_000n, 35, 'lender_credit_union');

  it('Privacy Test 1 — Public ledger state NEVER contains borrower financial figures', () => {
    const sensitiveWitness: BorrowerPrivateWitness = {
      creditScore: 780,
      annualIncome: 150_000n,
      monthlyDebt: 2_000n,
      borrowerSecret: 'super_secret_blinding_factor_xyz_999',
    };

    const verification = contract.verifyLoanEligibility(
      loanId,
      'borrower_alice_secretive',
      sensitiveWitness
    );

    expect(verification.isEligible).toBe(true);

    // Retrieve public ledger state
    const publicState = contract.getPublicLedgerState();
    const serializedState = JSON.stringify(publicState, (_key, value) =>
      typeof value === 'bigint' ? value.toString() : value
    );

    // Assert that NONE of the sensitive witness values appear anywhere in the serialized public ledger
    expect(serializedState).not.toContain('780'); // credit score
    expect(serializedState).not.toContain('150000'); // income
    expect(serializedState).not.toContain('2000'); // debt
    expect(serializedState).not.toContain('super_secret_blinding_factor'); // salt
    expect(serializedState).not.toContain('creditScore');
    expect(serializedState).not.toContain('annualIncome');
    expect(serializedState).not.toContain('monthlyDebt');
    expect(serializedState).not.toContain('borrowerSecret');
  });

  it('Privacy Test 2 — On-chain verification record discloses ONLY boolean outcome and commitment', () => {
    const witness: BorrowerPrivateWitness = {
      creditScore: 720,
      annualIncome: 75_000n,
      monthlyDebt: 1_100n,
      borrowerSecret: 'secret_bob_privacy',
    };

    const result = contract.verifyLoanEligibility(
      loanId,
      'borrower_bob_secretive',
      witness
    );

    const record = contract.verifications.get(result.verificationKey);
    expect(record).toBeDefined();

    // Verify properties of the public record
    const keys = Object.keys(record || {});
    expect(keys.sort()).toEqual(['borrowerCommitment', 'loanId', 'passed', 'timestamp'].sort());
    expect(typeof record?.passed).toBe('boolean');
    expect(typeof record?.borrowerCommitment).toBe('string');
    expect(record?.borrowerCommitment.length).toBe(64); // SHA-256 hex string
  });

  it('Privacy Test 3 — Cryptographic commitment binding & zero-knowledge collision resistance', () => {
    const borrowerId = 'borrower_charlie';
    const secret = 'salt_987654321';

    // Original commitment
    const commit1 = persistentCommit([borrowerId, 720, 80_000n, 1_000n], secret);

    // Tampered income (even by $1) yields completely uncorrelated commitment
    const commit2 = persistentCommit([borrowerId, 720, 80_001n, 1_000n], secret);

    // Tampered credit score yields completely uncorrelated commitment
    const commit3 = persistentCommit([borrowerId, 721, 80_000n, 1_000n], secret);

    // Different secret salt yields completely uncorrelated commitment
    const commit4 = persistentCommit([borrowerId, 720, 80_000n, 1_000n], 'different_salt');

    expect(commit1).not.toEqual(commit2);
    expect(commit1).not.toEqual(commit3);
    expect(commit1).not.toEqual(commit4);
    expect(commit1.length).toBe(64);
  });

  it('Privacy Test 4 — Two borrowers with identical financial figures receive distinct commitments', () => {
    const figures = [750, 90_000n, 1_500n];
    const commitAlice = persistentCommit(['borrower_alice', ...figures], 'alice_secret_salt');
    const commitBob = persistentCommit(['borrower_bob', ...figures], 'bob_secret_salt');

    expect(commitAlice).not.toEqual(commitBob);
  });
});
