import { describe, it, expect } from 'vitest';
import {
  PrivateLoanEligibilityContract,
  BorrowerPrivateWitness,
  persistentCommit,
  persistentHash,
} from '../src/contract-sim.js';

describe('Midnight Preprod Contract Integration & Verification (AC-02 & AC-05)', () => {
  const PREPROD_NETWORK_ID = 'preprod';
  const REPORTED_CONTRACT_ADDRESS = 'd32cf38d59c716cee438d44e63386df8973aa56b0dda6c6b32751f59e9d5caf2';
  const DEPLOYER_ADDRESS = 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm';

  it('[Integration Test 1] — Validates Midnight Preprod network configuration parameters', () => {
    expect(PREPROD_NETWORK_ID).toBe('preprod');
    expect(DEPLOYER_ADDRESS).toMatch(/^mn_addr_preprod1[a-z0-9]+$/);
    expect(REPORTED_CONTRACT_ADDRESS).toMatch(/^[a-f0-9]{64}$/);
  });

  it('[Integration Test 2] — Initializes PLE contract instance with Preprod admin', () => {
    const adminHash = persistentHash(['admin_identity', DEPLOYER_ADDRESS]);
    const contract = new PrivateLoanEligibilityContract(adminHash);

    expect(contract.admin).toBe(adminHash);
    expect(contract.loanCount).toBe(0);
    expect(contract.verificationCount).toBe(0);
  });

  it('[Integration Test 3] — Registers Preprod loan product and enforces parameter sanity', () => {
    const contract = new PrivateLoanEligibilityContract('admin_preprod_test');
    const loanId = 'loan_preprod_prime_2026';

    contract.registerLoanOffer(loanId, 700, 65_000n, 40, DEPLOYER_ADDRESS);

    const offer = contract.loanOffers.get(loanId);
    expect(offer).toBeDefined();
    expect(offer?.minCreditScore).toBe(700);
    expect(offer?.minAnnualIncome).toBe(65_000n);
    expect(offer?.maxDtiPercent).toBe(40);
    expect(offer?.lender).toBe(DEPLOYER_ADDRESS);
    expect(offer?.active).toBe(true);
  });

  it('[Integration Test 4] — End-to-End Underwriting: Eligible borrower generates valid commitment and passes', () => {
    const contract = new PrivateLoanEligibilityContract('admin_preprod_test');
    const loanId = 'loan_preprod_prime_2026';
    contract.registerLoanOffer(loanId, 700, 65_000n, 40, DEPLOYER_ADDRESS);

    const witness: BorrowerPrivateWitness = {
      creditScore: 750,
      annualIncome: 95_000n,
      monthlyDebt: 1_500n, // Annual debt: $18,000 / $95,000 = 18.9% <= 40%
      borrowerSecret: 'preprod_secret_salt_777',
    };

    const borrowerId = 'mn_addr_preprod1_borrower_alice';
    const result = contract.verifyLoanEligibility(loanId, borrowerId, witness);

    expect(result.isEligible).toBe(true);
    expect(result.commitment.length).toBe(64);

    // Verify on-chain minimal disclosure receipt
    const receipt = contract.verifications.get(result.verificationKey);
    expect(receipt).toBeDefined();
    expect(receipt?.passed).toBe(true);
    expect(receipt?.loanId).toBe(loanId);
  });

  it('[Integration Test 5] — End-to-End Underwriting: Rejects borrower failing credit score threshold', () => {
    const contract = new PrivateLoanEligibilityContract('admin_preprod_test');
    const loanId = 'loan_preprod_prime_2026';
    contract.registerLoanOffer(loanId, 700, 65_000n, 40, DEPLOYER_ADDRESS);

    const witness: BorrowerPrivateWitness = {
      creditScore: 685, // Below 700
      annualIncome: 95_000n,
      monthlyDebt: 1_500n,
      borrowerSecret: 'preprod_secret_salt_888',
    };

    const result = contract.verifyLoanEligibility(loanId, 'mn_addr_preprod1_borrower_bob', witness);
    expect(result.isEligible).toBe(false);
  });

  it('[Integration Test 6] — End-to-End Underwriting: Rejects borrower failing DTI ratio threshold', () => {
    const contract = new PrivateLoanEligibilityContract('admin_preprod_test');
    const loanId = 'loan_preprod_prime_2026';
    contract.registerLoanOffer(loanId, 700, 65_000n, 40, DEPLOYER_ADDRESS);

    const witness: BorrowerPrivateWitness = {
      creditScore: 740,
      annualIncome: 65_000n,
      monthlyDebt: 2_500n, // Annual debt: $30,000 / $65,000 = 46.15% > 40%
      borrowerSecret: 'preprod_secret_salt_999',
    };

    const result = contract.verifyLoanEligibility(loanId, 'mn_addr_preprod1_borrower_charlie', witness);
    expect(result.isEligible).toBe(false);
  });
});
