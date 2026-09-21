import React from 'react';
import { X, Shield, Lock, Eye, CheckCircle } from 'lucide-react';

interface PrivacyModelDrawerProps {
  onClose: () => void;
}

export const PrivacyModelDrawer: React.FC<PrivacyModelDrawerProps> = ({ onClose }) => {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{ maxWidth: '640px', maxHeight: '88vh' }}
      >
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Shield size={20} color="var(--accent-glow)" />
            <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700 }}>
              Privacy Model Architecture (AC-03)
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

        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', lineHeight: 1.6 }}>
            Private Loan Eligibility (PLE) uses Midnight Network's Compact language and Zero-Knowledge (ZK) circuits to decouple underwriting evaluation from raw data exposure.
          </p>

          {/* Tier 1: PRIVATE */}
          <div style={{
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#fda4af', fontWeight: 700, marginBottom: '6px' }}>
              <Lock size={16} />
              <span>1. PRIVATE (Witnesses — Never Stored on Ledger)</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <li><strong>Annual Gross Income:</strong> Kept strictly inside borrower's local prover.</li>
              <li><strong>Exact Credit Score:</strong> e.g., 740 is never broadcast over the network.</li>
              <li><strong>Monthly Debt Obligations:</strong> Private balance figures are never disclosed.</li>
              <li><strong>Blinding Factor:</strong> 256-bit cryptographically secure salt.</li>
            </ul>
          </div>

          {/* Tier 2: PUBLIC */}
          <div style={{
            background: 'rgba(6, 182, 212, 0.08)',
            border: '1px solid rgba(6, 182, 212, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#67e8f9', fontWeight: 700, marginBottom: '6px' }}>
              <Eye size={16} />
              <span>2. PUBLIC (Intentionally Verifiable on Ledger)</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <li><strong>Loan Underwriting Criteria:</strong> Min Credit Score, Min Income, Max DTI.</li>
              <li><strong>Lender Address:</strong> Public Midnight address of the underwriting institution.</li>
              <li><strong>Cryptographic Commitment:</strong> SHA-256 persistent commitment hash.</li>
              <li><strong>Verification Timestamp:</strong> Unix epoch confirmation on Midnight.</li>
            </ul>
          </div>

          {/* Tier 3: PROVED */}
          <div style={{
            background: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#6ee7b7', fontWeight: 700, marginBottom: '6px' }}>
              <CheckCircle size={16} />
              <span>3. PROVED (Minimal Necessary Disclosure)</span>
            </div>
            <ul style={{ paddingLeft: '20px', fontSize: '0.85rem', color: 'var(--text-main)', lineHeight: 1.6 }}>
              <li><strong>Credit Qualification:</strong> Verifies <code>creditScore ≥ minCreditScore</code>.</li>
              <li><strong>Income Qualification:</strong> Verifies <code>annualIncome ≥ minAnnualIncome</code>.</li>
              <li><strong>Debt-to-Income Constraint:</strong> Verifies <code>(debt × 12 × 100) ≤ (income × maxDti)</code>.</li>
              <li><strong>Boolean Result:</strong> Only <code>true/false</code> is written to the Midnight ledger.</li>
            </ul>
          </div>

          <button onClick={onClose} className="btn-secondary" style={{ width: '100%', padding: '10px' }}>
            Close Architecture Guide
          </button>
        </div>
      </div>
    </div>
  );
};
