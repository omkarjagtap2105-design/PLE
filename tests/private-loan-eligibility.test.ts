import { describe, it, expect, beforeEach } from 'vitest';
import {
  PrivateLoanEligibilityContract,
  BorrowerPrivateWitness,
  persistentCommit,
} from '../src/contract-sim.js';

describe('Private Loan Eligibility (PLE) Smart Contract & Privacy Logic', () => {
  let contract: PrivateLoanEligibilityContract;
  const adminId = 'admin_0x11111111111111111111111111111111';
  const lenderId = 'lender_bank_of_midnight_0x2222';
  const standardLoanId = 'loan_prime_mortgage_2026';

  beforeEach(() => {
    contract = new PrivateLoanEligibilityContract(adminId);
    // Register standard prime loan offer:
    // Min Credit Score: 680
    // Min Annual Income: $50,000
    // Max DTI: 43%
    contract.registerLoanOffer(
      standardLoanId,
      680,
      50_000n,
      43,
      lenderId
    );
  });

  describe('Core Eligibility Underwriting Rules (AC-05 Minimum Coverage)', () => {
    it('Scenario 1 — Fully eligible borrower (Credit 740, Income $85k, Debt $1,200/mo -> DTI 16.9%)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 740,
        annualIncome: 85_000n,
        monthlyDebt: 1_200n,
        borrowerSecret: 'secret_salt_borrower_alice_123',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_alice_pseudonym',
        witness
      );

      expect(result.isEligible).toBe(true);
      expect(contract.verificationCount).toBe(1);

      // Verify the on-chain recorded receipt
      const receipt = contract.verifications.get(result.verificationKey);
      expect(receipt).toBeDefined();
      expect(receipt?.passed).toBe(true);
      expect(receipt?.loanId).toBe(standardLoanId);
      expect(receipt?.borrowerCommitment).toBe(result.commitment);
    });

    it('Scenario 2 — Ineligible borrower failing Credit Score threshold (Credit 650 < 680)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 650, // Below 680 requirement
        annualIncome: 90_000n, // Sufficient
        monthlyDebt: 1_000n, // Sufficient DTI
        borrowerSecret: 'secret_salt_borrower_bob_456',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_bob_pseudonym',
        witness
      );

      expect(result.isEligible).toBe(false);
      const receipt = contract.verifications.get(result.verificationKey);
      expect(receipt?.passed).toBe(false);
    });

    it('Scenario 3 — Ineligible borrower failing Income threshold (Income $42,000 < $50,000)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 750, // Sufficient
        annualIncome: 42_000n, // Below $50,000 requirement
        monthlyDebt: 500n, // Low debt
        borrowerSecret: 'secret_salt_borrower_charlie_789',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_charlie_pseudonym',
        witness
      );

      expect(result.isEligible).toBe(false);
      const receipt = contract.verifications.get(result.verificationKey);
      expect(receipt?.passed).toBe(false);
    });

    it('Scenario 4 — Ineligible borrower failing Debt-to-Income (DTI) threshold (DTI 50% > 43%)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 720, // Sufficient
        annualIncome: 60_000n, // Sufficient
        monthlyDebt: 2_500n, // Annual debt = $30,000 => DTI = 30k/60k = 50% (Exceeds 43%)
        borrowerSecret: 'secret_salt_borrower_david_101',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_david_pseudonym',
        witness
      );

      expect(result.isEligible).toBe(false);
      const receipt = contract.verifications.get(result.verificationKey);
      expect(receipt?.passed).toBe(false);
    });
  });

  describe('Boundary Conditions & Precision Edge Cases', () => {
    it('Scenario 5 — Exact Credit Score boundary (Credit 680 == 680)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 680, // Exact boundary
        annualIncome: 50_000n,
        monthlyDebt: 1_000n, // Annual debt $12k / $50k = 24% <= 43%
        borrowerSecret: 'secret_boundary_credit',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_boundary_credit',
        witness
      );

      expect(result.isEligible).toBe(true);
    });

    it('Scenario 6 — Just below Credit Score boundary (Credit 679 < 680)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 679, // 1 point below
        annualIncome: 50_000n,
        monthlyDebt: 1_000n,
        borrowerSecret: 'secret_boundary_credit_below',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_boundary_credit_below',
        witness
      );

      expect(result.isEligible).toBe(false);
    });

    it('Scenario 7 — Exact Annual Income boundary (Income $50,000 == $50,000)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 700,
        annualIncome: 50_000n, // Exact boundary
        monthlyDebt: 1_000n,
        borrowerSecret: 'secret_boundary_income',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_boundary_income',
        witness
      );

      expect(result.isEligible).toBe(true);
    });

    it('Scenario 8 — Just below Annual Income boundary (Income $49,999 < $50,000)', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 700,
        annualIncome: 49_999n, // $1 below boundary
        monthlyDebt: 1_000n,
        borrowerSecret: 'secret_boundary_income_below',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_boundary_income_below',
        witness
      );

      expect(result.isEligible).toBe(false);
    });

    it('Scenario 9 — Exact DTI ratio boundary (Annual debt * 100 == Income * maxDti)', () => {
      // Loan terms: Income $100,000, Max DTI 43%
      // Allowed annual debt = $43,000
      // If monthlyDebt = $3,583.33 -> let's test integer math:
      // With annualIncome = 120,000n, maxDti = 43% => 120,000 * 43 = 5,160,000
      // annualDebt * 100 = (monthlyDebt * 12) * 100 = monthlyDebt * 1,200
      // If monthlyDebt = 4,300n => annualDebt * 100 = 4,300 * 1,200 = 5,160,000
      // Exactly matches max allowed!
      contract.registerLoanOffer('loan_high_earner', 600, 100_000n, 43, lenderId);

      const exactDtiWitness: BorrowerPrivateWitness = {
        creditScore: 650,
        annualIncome: 120_000n,
        monthlyDebt: 4_300n, // 4300 * 12 * 100 = 5,160,000 == 120,000 * 43
        borrowerSecret: 'secret_exact_dti',
      };

      const result = contract.verifyLoanEligibility(
        'loan_high_earner',
        'borrower_exact_dti',
        exactDtiWitness
      );

      expect(result.isEligible).toBe(true);
    });

    it('Scenario 10 — Just 1 dollar over DTI boundary fails (monthlyDebt 4,301n)', () => {
      const overDtiWitness: BorrowerPrivateWitness = {
        creditScore: 650,
        annualIncome: 120_000n,
        monthlyDebt: 4_301n, // 4301 * 12 * 100 = 5,161,200 > 5,160,000
        borrowerSecret: 'secret_over_dti',
      };

      const result = contract.verifyLoanEligibility(
        'loan_high_earner',
        'borrower_over_dti',
        overDtiWitness
      );

      expect(result.isEligible).toBe(false);
    });

    it('Scenario 11 — Zero debt borrower (monthlyDebt = $0) passes with 0% DTI', () => {
      const zeroDebtWitness: BorrowerPrivateWitness = {
        creditScore: 780,
        annualIncome: 65_000n,
        monthlyDebt: 0n, // Zero debt
        borrowerSecret: 'secret_zero_debt',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_zero_debt',
        zeroDebtWitness
      );

      expect(result.isEligible).toBe(true);
    });

    it('Scenario 12 — Zero income borrower (annualIncome = $0) fails safely without divide-by-zero crash', () => {
      const zeroIncomeWitness: BorrowerPrivateWitness = {
        creditScore: 800,
        annualIncome: 0n,
        monthlyDebt: 100n,
        borrowerSecret: 'secret_zero_income',
      };

      const result = contract.verifyLoanEligibility(
        standardLoanId,
        'borrower_zero_income',
        zeroIncomeWitness
      );

      expect(result.isEligible).toBe(false);
    });
  });

  describe('Contract Administration & State Invariants', () => {
    it('Scenario 13 — Deactivated loan offer rejects applications', () => {
      contract.deactivateLoanOffer(standardLoanId);

      const witness: BorrowerPrivateWitness = {
        creditScore: 750,
        annualIncome: 80_000n,
        monthlyDebt: 500n,
        borrowerSecret: 'secret_deactivated',
      };

      expect(() => {
        contract.verifyLoanEligibility(
          standardLoanId,
          'borrower_deactivated',
          witness
        );
      }).toThrow('Loan offer is not active');
    });

    it('Scenario 14 — Non-existent loan offer throws clear error', () => {
      const witness: BorrowerPrivateWitness = {
        creditScore: 750,
        annualIncome: 80_000n,
        monthlyDebt: 500n,
        borrowerSecret: 'secret_nonexistent',
      };

      expect(() => {
        contract.verifyLoanEligibility(
          'loan_does_not_exist',
          'borrower_nonexistent',
          witness
        );
      }).toThrow('Loan offer not found');
    });

    it('Scenario 15 — Rejects invalid loan terms registration (credit score > 850)', () => {
      expect(() => {
        contract.registerLoanOffer('loan_bad_credit', 900, 50_000n, 40, lenderId);
      }).toThrow('Invalid credit score threshold');
    });
  });
});
