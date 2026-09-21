export interface LoanOffer {
  id: string;
  title: string;
  category: 'Mortgage' | 'Auto Loan' | 'Personal' | 'Business';
  amount: number;
  interestRate: number; // e.g. 5.8%
  minCreditScore: number;
  minIncome: number;
  maxDtiPercent: number;
  lenderName: string;
  lenderAddress: string;
  active: boolean;
}

export interface BorrowerPrivateData {
  creditScore: number;
  annualIncome: number;
  monthlyDebt: number;
  borrowerSecret: string;
}

export interface ProofStep {
  id: number;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'failed';
}

export interface VerificationResult {
  loanId: string;
  loanTitle: string;
  borrowerCommitment: string;
  isEligible: boolean;
  timestamp: number;
  txHash: string;
  verificationKey: string;
  rulesEvaluated: {
    creditScorePassed: boolean;
    incomePassed: boolean;
    dtiPassed: boolean;
  };
}

export interface WalletState {
  connected: boolean;
  address: string | null;
  network: string;
  balanceDust: number;
  isConnecting: boolean;
  error: string | null;
  connector: 'lace' | 'demo';
}
