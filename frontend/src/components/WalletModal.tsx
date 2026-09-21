import React, { useState } from 'react';
import { X, Wallet, CheckCircle2, AlertTriangle, ExternalLink, Shield } from 'lucide-react';
import { WalletState } from '../types';
import { MidnightWalletService } from '../services/midnightWallet';

interface WalletModalProps {
  wallet: WalletState;
  onClose: () => void;
  onWalletUpdated: (newState: WalletState) => void;
}

export const WalletModal: React.FC<WalletModalProps> = ({
  wallet,
  onClose,
  onWalletUpdated,
}) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLace = MidnightWalletService.isLaceAvailable();

  const handleConnectLace = async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await MidnightWalletService.connectLace();
      onWalletUpdated(state);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect Lace wallet');
    } finally {
      setLoading(false);
    }
  };

  const handleConnectDemo = async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await MidnightWalletService.connectDemo();
      onWalletUpdated(state);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Demo connection failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDisconnect = () => {
    onWalletUpdated({
      connected: false,
      address: null,
      network: 'Midnight Preprod',
      balanceDust: 0,
      isConnecting: false,
      error: null,
      connector: 'lace',
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '480px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Wallet size={20} color="var(--accent-glow)" />
            <h3 className="font-display" style={{ fontSize: '1.15rem', fontWeight: 700 }}>
              {wallet.connected ? 'Wallet Details' : 'Connect Midnight Wallet'}
            </h3>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-muted)',
              cursor: 'pointer',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: '24px' }}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              gap: '12px',
              fontSize: '0.85rem',
              color: '#fda4af',
            }}>
              <AlertTriangle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          {wallet.connected && wallet.address ? (
            <div>
              <div style={{
                background: 'rgba(15, 23, 42, 0.9)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-md)',
                padding: '18px',
                marginBottom: '20px',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Connection Status</span>
                  <span className="badge badge-success">Connected ({wallet.connector.toUpperCase()})</span>
                </div>

                <div style={{ marginBottom: '14px' }}>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '4px' }}>
                    Midnight Address
                  </div>
                  <div className="font-mono" style={{
                    fontSize: '0.82rem',
                    background: 'rgba(0,0,0,0.3)',
                    padding: '8px 12px',
                    borderRadius: '6px',
                    wordBreak: 'break-all',
                    color: 'var(--text-main)',
                  }}>
                    {wallet.address}
                  </div>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Network</span>
                  <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{wallet.network}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Testnet Balance</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-glow)' }}>
                    {wallet.balanceDust} tDUST
                  </span>
                </div>
              </div>

              <button
                onClick={handleDisconnect}
                className="btn-secondary"
                style={{ width: '100%', borderColor: 'rgba(244, 63, 94, 0.3)', color: '#fda4af' }}
              >
                Disconnect Wallet
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div style={{
                background: 'rgba(99, 102, 241, 0.08)',
                border: '1px solid var(--border-accent)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                fontSize: '0.85rem',
                color: 'var(--text-muted)',
                lineHeight: 1.4,
              }}>
                <Shield size={16} color="var(--accent-glow)" style={{ display: 'inline', marginRight: '6px', verticalAlign: '-3px' }} />
                Connect your Lace wallet on Midnight Preprod to generate zero-knowledge loan eligibility proofs and interact with the contract.
              </div>

              {/* Lace Connector Option */}
              <button
                onClick={handleConnectLace}
                disabled={loading}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <Wallet size={18} />
                  <span>Midnight Lace Wallet</span>
                </div>
                {hasLace ? (
                  <span className="badge badge-success" style={{ fontSize: '0.65rem' }}>Detected</span>
                ) : (
                  <span className="badge badge-network" style={{ fontSize: '0.65rem' }}>Extension Required</span>
                )}
              </button>

              {/* Preprod Demo Mode Option */}
              <button
                onClick={handleConnectDemo}
                disabled={loading}
                className="btn-secondary"
                style={{
                  width: '100%',
                  padding: '14px',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2 size={18} color="#10b981" />
                  <span>Interactive Preprod Testnet Session</span>
                </div>
                <span className="badge badge-privacy" style={{ fontSize: '0.65rem' }}>Direct Test</span>
              </button>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                textAlign: 'center',
                marginTop: '10px',
              }}>
                Need Midnight Lace extension?{' '}
                <a
                  href="https://chromewebstore.google.com/detail/lace/gafhhkghbfjjkeiendhlofajokpaflmk"
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-glow)', textDecoration: 'none' }}
                >
                  Install from Chrome Web Store <ExternalLink size={12} style={{ display: 'inline' }} />
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
