import React from 'react';
import { ShieldCheck, Wallet, PlusCircle, HelpCircle } from 'lucide-react';
import { WalletState } from '../types';

interface HeaderProps {
  wallet: WalletState;
  onOpenWalletModal: () => void;
  onOpenCreateLoan: () => void;
  onOpenPrivacyModel: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  wallet,
  onOpenWalletModal,
  onOpenCreateLoan,
  onOpenPrivacyModel,
}) => {
  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 10)}...${addr.slice(-6)}`;
  };

  return (
    <header style={{
      borderBottom: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 19, 0.8)',
      backdropFilter: 'blur(12px)',
      position: 'sticky',
      top: 0,
      zIndex: 40,
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        padding: '16px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '16px',
      }}>
        {/* Logo & Brand */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: '0 0 20px rgba(99, 102, 241, 0.4)',
          }}>
            <ShieldCheck size={24} color="#ffffff" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-display" style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em' }}>
                PLE
              </span>
              <span className="badge badge-privacy" style={{ fontSize: '0.65rem' }}>
                Zero-Knowledge
              </span>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
              Private Loan Eligibility • Midnight Network
            </div>
          </div>
        </div>

        {/* Network & Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
          {/* Network Indicator */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 14px',
            borderRadius: 'var(--radius-full)',
            background: 'var(--bg-glass-strong)',
            border: '1px solid var(--border-subtle)',
            fontSize: '0.8rem',
          }}>
            <span style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              background: '#10b981',
              boxShadow: '0 0 8px #10b981',
              display: 'inline-block',
            }} />
            <span style={{ color: 'var(--text-muted)' }}>Network:</span>
            <span style={{ fontWeight: 600, color: 'var(--text-main)' }}>Midnight Preprod</span>
          </div>

          {/* Privacy Model Button */}
          <button
            onClick={onOpenPrivacyModel}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <HelpCircle size={16} />
            Privacy Architecture
          </button>

          {/* Create Loan Product (Lender View) */}
          <button
            onClick={onOpenCreateLoan}
            className="btn-secondary"
            style={{ fontSize: '0.85rem', padding: '8px 14px' }}
          >
            <PlusCircle size={16} />
            Offer Loan
          </button>

          {/* Wallet Button */}
          {wallet.connected && wallet.address ? (
            <button
              onClick={onOpenWalletModal}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 16px',
                borderRadius: 'var(--radius-sm)',
                background: 'rgba(99, 102, 241, 0.15)',
                border: '1px solid var(--border-accent)',
                color: 'var(--text-main)',
                cursor: 'pointer',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              <Wallet size={16} color="var(--accent-glow)" />
              <span className="font-mono">{formatAddress(wallet.address)}</span>
              <span style={{
                background: 'rgba(255, 255, 255, 0.1)',
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '0.75rem',
                color: 'var(--accent-glow)',
              }}>
                {wallet.balanceDust.toFixed(1)} tDUST
              </span>
            </button>
          ) : (
            <button
              onClick={onOpenWalletModal}
              className="btn-primary"
              style={{ fontSize: '0.85rem', padding: '8px 18px' }}
            >
              <Wallet size={16} />
              Connect Lace Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
