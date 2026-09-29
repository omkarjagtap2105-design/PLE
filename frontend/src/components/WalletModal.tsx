import React, { useState } from 'react';
import { X, Wallet, AlertTriangle, Shield } from 'lucide-react';
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

  const handleConnect1AM = async () => {
    setLoading(true);
    setError(null);
    try {
      const state = await MidnightWalletService.connect1AM();
      onWalletUpdated(state);
      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to connect 1AM wallet');
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
      balanceTnight: 0,
      isConnecting: false,
      error: null,
      connector: '1am',
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
              whiteSpace: 'pre-wrap',
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
                  <span className="badge badge-success">Connected (1AM)</span>
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
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>tNIGHT Balance</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-glow)' }}>
                    {wallet.balanceTnight.toLocaleString()} tNIGHT
                  </span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '8px' }}>
                  <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>DUST Balance</span>
                  <span style={{ fontSize: '0.95rem', fontWeight: 700, color: 'var(--accent-glow)' }}>
                    {wallet.balanceDust.toLocaleString()} DUST
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
                Connect your 1AM / I AM Wallet on Midnight Preprod to generate zero-knowledge loan eligibility proofs and interact with the contract.
              </div>

              {/* 1AM Connector Option */}
              <button
                onClick={handleConnect1AM}
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
                  <span>Connect 1AM Wallet</span>
                </div>
                <span className="badge badge-network" style={{ fontSize: '0.65rem' }}>
                  Midnight Preprod
                </span>
              </button>

              <div style={{
                fontSize: '0.75rem',
                color: 'var(--text-dim)',
                textAlign: 'center',
                marginTop: '10px',
              }}>
                Make sure the 1AM wallet is unlocked and set to Midnight Preprod, then click connect.
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
