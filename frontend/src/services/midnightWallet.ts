import { WalletState } from '../types';
import type {
  InitialAPI,
  ConnectedAPI,
} from '@midnight-ntwrk/dapp-connector-api';

declare global {
  interface Window {
    midnight?: {
      [key: string]: InitialAPI;
    };
  }
}

function find1AMWallet(): InitialAPI | null {
  if (typeof window === 'undefined' || !window.midnight) {
    return null;
  }

  const wallets = Object.values(window.midnight);

  const target = wallets.find((wallet) => {
    if (!wallet || typeof wallet !== 'object') {
      return false;
    }

    const name = typeof wallet.name === 'string' ? wallet.name.toLowerCase() : '';
    const rdns = typeof wallet.rdns === 'string' ? wallet.rdns.toLowerCase() : '';

    return (
      name === '1am' ||
      name === 'i am' ||
      rdns === 'com.midnight.1am'
    );
  });

  return target ?? null;
}

function describeWallets(): Record<string, { name: string; apiVersion: string; rdns: string }> {
  if (typeof window === 'undefined' || !window.midnight) {
    return {};
  }

  const result: Record<string, { name: string; apiVersion: string; rdns: string }> = {};
  const entries = Object.entries(window.midnight);

  for (const [key, wallet] of entries) {
    if (wallet && typeof wallet === 'object') {
      result[key] = {
        name: typeof wallet.name === 'string' ? wallet.name : 'unknown',
        apiVersion: typeof wallet.apiVersion === 'string' ? wallet.apiVersion : 'unknown',
        rdns: typeof wallet.rdns === 'string' ? wallet.rdns : 'unknown',
      };
    }
  }

  return result;
}

export class MidnightWalletService {
  public static is1AMAvailable(): boolean {
    return find1AMWallet() !== null;
  }

  public static async connect1AM(): Promise<WalletState> {
    let wallet: InitialAPI | null | undefined = find1AMWallet();

    if (!wallet && window.midnight) {
      const visible = describeWallets();
      console.log('[Midnight] Wallets visible on window.midnight:', visible);
      const candidates = Object.values(window.midnight);
      wallet = candidates.find((candidate) => {
        if (!candidate || typeof candidate !== 'object') {
          return false;
        }
        const name = typeof candidate.name === 'string' ? candidate.name.toLowerCase() : '';
        const rdns = typeof candidate.rdns === 'string' ? candidate.rdns.toLowerCase() : '';
        return (
          (name === '1am' || name === 'i am' || rdns === 'com.midnight.1am') &&
          typeof candidate.connect === 'function'
        );
      });
    }

    if (!wallet) {
      const visible = describeWallets();
      const names = Object.values(visible).map((w) => w.name).join(', ');
      throw new Error(
        `1AM Wallet was not detected. Please install and unlock the 1AM wallet, then refresh this page.\n\nDetected wallets: ${names || 'none'}\n\nCheck the browser console for detailed wallet information.`
      );
    }

    try {
      console.log('[Midnight] 1AM Wallet detected:', {
        name: wallet.name,
        rdns: wallet.rdns,
        apiVersion: wallet.apiVersion,
      });

      const connected: ConnectedAPI = await wallet.connect('preprod');

      console.log('[Midnight] Successfully connected to 1AM Wallet on Preprod.');

      const addressResult = await connected.getUnshieldedAddress();
      const address = addressResult.unshieldedAddress;

      console.log('[Midnight] Unshielded address:', address);

      let balanceDust = 0;
      let balanceTnight = 0;

      try {
        const dust = await connected.getDustBalance();
        console.log('[Midnight] DUST balance:', dust.balance.toString());
        console.log('[Midnight] DUST cap:', dust.cap.toString());
        balanceDust = Number(dust.balance) / 1_000_000;
      } catch (balanceError) {
        console.warn('[Midnight] Unable to read DUST balance:', balanceError);
      }

      try {
        const unshielded = await connected.getUnshieldedBalances();
        console.log('[Midnight] Unshielded balances:', unshielded);
        const values = Object.values(unshielded);
        if (values.length > 0) {
          balanceTnight = Number(values[0]) / 1_000_000;
        }
      } catch (balanceError) {
        console.warn('[Midnight] Unable to read unshielded balances:', balanceError);
      }

      return {
        connected: true,
        address,
        network: 'Midnight Preprod',
        balanceDust,
        balanceTnight,
        isConnecting: false,
        error: null,
        connector: '1am',
      };
    } catch (err: unknown) {
      console.error('[Midnight] 1AM Wallet connection failed:', err);

      const message =
        err instanceof Error
          ? err.message
          : '1AM Wallet connection failed or was rejected by the user.';

      if (message.includes('shutdown') || message.includes('can no longer be used')) {
        throw new Error(
          '1AM Wallet Midnight connection was lost. Please unlock the 1AM wallet, confirm it is on Midnight Preprod, then try again.'
        );
      }

      throw new Error(
        `1AM Wallet was detected, but the connection to Midnight Preprod failed.\n\nReason: ${message}\n\nCheck the browser console for technical details.`
      );
    }
  }
}
