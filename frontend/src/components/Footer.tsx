import React from 'react';
import { Shield } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer style={{
      borderTop: '1px solid var(--border-subtle)',
      background: 'rgba(7, 9, 19, 0.9)',
      padding: '40px 24px',
      marginTop: '80px',
    }}>
      <div style={{
        maxWidth: '1240px',
        margin: '0 auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        flexWrap: 'wrap',
        gap: '24px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <Shield size={18} color="var(--accent-glow)" />
            <span className="font-display" style={{ fontWeight: 800, fontSize: '1.1rem' }}>
              PLE — Private Loan Eligibility
            </span>
          </div>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', maxWidth: '480px' }}>
            A production-ready Zero-Knowledge loan underwriting DApp powered by Midnight Network Compact smart contracts and Lace Wallet.
          </p>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '8px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span className="badge badge-network" style={{ fontSize: '0.7rem' }}>
              Midnight Preprod
            </span>
            <span className="badge badge-privacy" style={{ fontSize: '0.7rem' }}>
              Level 4 MVP
            </span>
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)' }}>
            © 2026 Omkar Jagtap. Built for Midnight Builder Challenge.
          </div>
        </div>
      </div>
    </footer>
  );
};
