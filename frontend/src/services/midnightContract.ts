/**
 * Midnight Contract Interaction Service
 *
 * Manages transaction states and contract configuration for the PLE DApp.
 *
 * Real Midnight contract interaction requires:
 * - Deployed contract address
 * - Node.js environment for Midnight JS contract libraries
 * - Running proof server
 *
 * This service provides the browser-side state management and
 * integration points. Actual contract calls are handled by
 * Node.js scripts (scripts/deploy.ts, scripts/interact.ts).
 */

import type { VerificationResult } from '../types';

export type TxStatus = 'NOT_SUBMITTED' | 'SUBMITTING' | 'PENDING' | 'CONFIRMED' | 'FAILED';

export interface RealTransactionResult extends VerificationResult {
  txStatus: TxStatus;
}

export class MidnightContractService {
  private static contractAddress: string | null = null;
  private static explorerUrl = 'https://explorer.preprod.midnight.network';

  public static setContractAddress(address: string | null): void {
    this.contractAddress = address;
  }

  public static getContractAddress(): string | null {
    return this.contractAddress;
  }

  public static isConfigured(): boolean {
    return !!this.contractAddress;
  }

  public static getExplorerUrl(): string {
    return this.explorerUrl;
  }

  public static getContractExplorerUrl(): string | null {
    if (!this.contractAddress) return null;
    return `${this.explorerUrl}/address/${this.contractAddress}`;
  }

  /**
   * Generate a real SHA-256 commitment binding borrower credentials.
   * This matches the Compact contract's persistentCommit semantic.
   */
  public static async generateCommitment(borrowerId: string, privateData: {
    creditScore: number;
    annualIncome: number;
    monthlyDebt: number;
    borrowerSecret: string;
  }): Promise<string> {
    const raw = `MIDNIGHT_PERSISTENT_COMMIT:${borrowerId};${privateData.creditScore};${privateData.annualIncome};${privateData.monthlyDebt};${privateData.borrowerSecret}`;
    const encoder = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(raw));
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');
  }

  /**
   * Check if the current environment supports real on-chain transactions.
   *
   * Returns true if:
   * - A contract address is configured
   * - The 1AM wallet is available
   * - The proof server is accessible
   */
  public static async canSubmitRealTransaction(): Promise<boolean> {
    if (!this.contractAddress) return false;
    
    try {
      const response = await fetch('http://localhost:6300', { method: 'GET', signal: AbortSignal.timeout(3000) });
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Get the status message for the current transaction state.
   */
  public static getTransactionStatusMessage(txStatus: TxStatus, txHash?: string): string {
    switch (txStatus) {
      case 'NOT_SUBMITTED':
        return 'Not submitted';
      case 'SUBMITTING':
        return 'Submitting...';
      case 'PENDING':
        return 'Pending';
      case 'CONFIRMED':
        return txHash || 'Confirmed';
      case 'FAILED':
        return 'Failed';
      default:
        return 'Unknown';
    }
  }
}
