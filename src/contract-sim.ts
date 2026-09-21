import { createHash } from 'node:crypto';

/**
 * Public loan terms registered by lenders.
 */
export interface LoanTerms {
  loanId: string;
  minCreditScore: number;
  minAnnualIncome: bigint;
  maxDtiPercent: number;
  lender: string;
  active: boolean;
}

/**
 * On-chain verification record (minimal disclosure receipt).
 */
export interface VerificationRecord {
  loanId: string;
  borrowerCommitment: string;
  passed: boolean;
  timestamp: number;
}

/**
 * Private witness inputs provided solely by the borrower during proof generation.
 * NEVER stored on-chain or transmitted across the wire.
 */
export interface BorrowerPrivateWitness {
  creditScore: number;
  annualIncome: bigint;
  monthlyDebt: bigint;
  borrowerSecret: string;
}

/**
 * Cryptographic helper: persistentCommit matching Midnight SHA-256 domain-separated commitments.
 */
export function persistentCommit(elements: (string | bigint | number)[], secret: string): string {
  const hash = createHash('sha256');
  hash.update('MIDNIGHT_PERSISTENT_COMMIT:');
  for (const el of elements) {
    hash.update(String(el));
    hash.update(';');
  }
  hash.update(secret);
  return hash.digest('hex');
}

/**
 * Cryptographic helper: persistentHash matching Midnight SHA-256 domain-separated hashing.
 */
export function persistentHash(elements: string[]): string {
  const hash = createHash('sha256');
  hash.update('MIDNIGHT_PERSISTENT_HASH:');
  for (const el of elements) {
    hash.update(el);
    hash.update(';');
  }
  return hash.digest('hex');
}

/**
 * Private Loan Eligibility (PLE) Contract Simulator
 * Faithfully simulates the Compact contract circuits and ledger state in TypeScript.
 */
export class PrivateLoanEligibilityContract {
  public admin: string;
  public loanOffers: Map<string, LoanTerms> = new Map();
  public loanCount = 0;
  public verifications: Map<string, VerificationRecord> = new Map();
  public verificationCount = 0;

  constructor(adminId: string) {
    this.admin = adminId;
  }

  /**
   * Circuit: registerLoanOffer
   * Registers a new loan product with public underwriting thresholds.
   */
  public registerLoanOffer(
    loanId: string,
    minCreditScore: number,
    minAnnualIncome: bigint,
    maxDtiPercent: number,
    lender: string
  ): void {
    if (minCreditScore < 300 || minCreditScore > 850) {
      throw new Error(`Invalid credit score threshold: ${minCreditScore}. Must be 300-850.`);
    }
    if (minAnnualIncome < 0n) {
      throw new Error(`Invalid minimum income: ${minAnnualIncome}. Must be non-negative.`);
    }
    if (maxDtiPercent < 0 || maxDtiPercent > 100) {
      throw new Error(`Invalid max DTI percentage: ${maxDtiPercent}. Must be 0-100.`);
    }

    this.loanOffers.set(loanId, {
      loanId,
      minCreditScore,
      minAnnualIncome,
      maxDtiPercent,
      lender,
      active: true,
    });
    this.loanCount++;
  }

  /**
   * Circuit: deactivateLoanOffer
   */
  public deactivateLoanOffer(loanId: string): void {
    const offer = this.loanOffers.get(loanId);
    if (!offer) {
      throw new Error(`Loan offer not found: ${loanId}`);
    }
    offer.active = false;
  }

  /**
   * Circuit: verifyLoanEligibility
   * Zero-Knowledge Underwriting Proof:
   * Takes private borrower inputs and checks them against public loan criteria.
   * Returns and discloses ONLY the boolean qualification outcome.
   */
  public verifyLoanEligibility(
    loanId: string,
    borrowerId: string,
    privateWitness: BorrowerPrivateWitness,
    currentTime: number = Date.now()
  ): { isEligible: boolean; commitment: string; verificationKey: string } {
    const offer = this.loanOffers.get(loanId);
    if (!offer) {
      throw new Error(`Loan offer not found: ${loanId}`);
    }
    if (!offer.active) {
      throw new Error('Loan offer is not active');
    }

    const { creditScore, annualIncome, monthlyDebt, borrowerSecret } = privateWitness;

    // 1. Generate cryptographic commitment over private state
    const commitment = persistentCommit(
      [borrowerId, creditScore, annualIncome, monthlyDebt],
      borrowerSecret
    );

    // 2. Evaluate Underwriting Criteria in Zero Knowledge
    // Rule A: Credit score satisfies threshold
    const creditScoreOk = creditScore >= offer.minCreditScore;

    // Rule B: Annual income satisfies threshold
    const incomeOk = annualIncome >= offer.minAnnualIncome;

    // Rule C: Debt-to-Income (DTI) ratio satisfies maximum threshold
    // DTI = (monthlyDebt * 12 * 100) <= (annualIncome * maxDtiPercent)
    const annualDebt = monthlyDebt * 12n;
    const debtNumerator = annualDebt * 100n;
    const maxAllowedDebt = annualIncome * BigInt(offer.maxDtiPercent);
    const dtiOk = annualIncome > 0n && debtNumerator <= maxAllowedDebt;

    // Final qualification requires all three rules to pass
    const isEligible = creditScoreOk && incomeOk && dtiOk;

    // 3. Record minimal disclosure on ledger
    const verificationKey = persistentHash([loanId, borrowerId]);
    this.verifications.set(verificationKey, {
      loanId,
      borrowerCommitment: commitment,
      passed: isEligible,
      timestamp: currentTime,
    });
    this.verificationCount++;

    return {
      isEligible,
      commitment,
      verificationKey,
    };
  }

  /**
   * Inspect public ledger state. Guaranteed to contain NO private financial metrics.
   */
  public getPublicLedgerState(): {
    admin: string;
    loanCount: number;
    verificationCount: number;
    activeOffers: LoanTerms[];
    verifications: VerificationRecord[];
  } {
    return {
      admin: this.admin,
      loanCount: this.loanCount,
      verificationCount: this.verificationCount,
      activeOffers: Array.from(this.loanOffers.values()).filter((o) => o.active),
      verifications: Array.from(this.verifications.values()),
    };
  }
}
