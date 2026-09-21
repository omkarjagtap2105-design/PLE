import { WalletState } from '../types';

declare global {
  interface Window {
    midnight?: {
      mnLace?: {
        enable: () => Promise<{
          getNetworkId: () => Promise<string>;
          getUnusedAddresses: () => Promise<string[]>;
          getChangeAddress: () => Promise<string>;
          getBalance: () => Promise<bigint>;
        }>;
        isEnabled: () => Promise<boolean>;
        apiVersion: string;
        name: string;
      };
    };
  }
}

export class MidnightWalletService {
  public static isLaceAvailable(): boolean {
    return typeof window !== 'undefined' && !!window.midnight?.mnLace;
  }

  public static async connectLace(): Promise<WalletState> {
    if (!this.isLaceAvailable()) {
      throw new Error(
        'Midnight Lace Wallet extension is not installed or detected in this browser. Please install Midnight Lace or use the Preprod Demo mode.'
      );
    }

    try {
      const api = await window.midnight!.mnLace!.enable();
      const network = await api.getNetworkId();
      const addresses = await api.getUnusedAddresses();
      const changeAddress = await api.getChangeAddress();
      const address = addresses[0] || changeAddress || 'mn_addr_preprod_connected';
      let balanceDust = 0;

      try {
        const rawBalance = await api.getBalance();
        balanceDust = Number(rawBalance) / 1_000_000;
      } catch {
        balanceDust = 100;
      }

      return {
        connected: true,
        address,
        network: network || 'Midnight Preprod',
        balanceDust,
        isConnecting: false,
        error: null,
        connector: 'lace',
      };
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'User rejected Lace wallet connection';
      throw new Error(msg);
    }
  }

  public static async connectDemo(): Promise<WalletState> {
    // Generates an interactive Preprod simulated wallet session for reviewing without local extension
    await new Promise((resolve) => setTimeout(resolve, 600));
    return {
      connected: true,
      address: 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm',
      network: 'Midnight Preprod (Simulated)',
      balanceDust: 250.75,
      isConnecting: false,
      error: null,
      connector: 'demo',
    };
  }
}
