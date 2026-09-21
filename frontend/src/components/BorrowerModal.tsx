import React, { useState } from 'react';
import { X, Lock, ShieldCheck, Eye, EyeOff, Sparkles } from 'lucide-react';
import { LoanOffer, BorrowerPrivateData } from '../types';

interface BorrowerModalProps {
  offer: LoanOffer;
  onClose: () => void;
  onSubmitProof: (privateData: BorrowerPrivateData) => void;
}

export const BorrowerModal: React.FC<BorrowerModalProps> = ({
  offer,
  onClose,
  onSubmitProof,
}) => {
  const [creditScore, setCreditScore] = useState<number>(740);
  const [annualIncome, setAnnualIncome] = useState<number>(85000);
  const [monthlyDebt, setMonthlyDebt] = useState<number>(1200);
  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [borrowerSecret] = useState<string>(() => {
    return Array.from(crypto.getRandomValues(new Uint8Array(16)))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');
  });

  // Calculate live DTI ratio
  const annualDebt = monthlyDebt * 12;
  const calculatedDti = annualIncome > 0 ? ((annualDebt / annualIncome) * 100).toFixed(1) : '0.0';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmitProof({
      creditScore,
      annualIncome,
      monthlyDebt,
      borrowerSecret,
    });
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '580px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '2px' }}>
              <span className="badge badge-privacy" style={{ fontSize: '0.65rem' }}>
                <Lock size={12} /> Confidential Underwriting
              </span>
            </div>
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Apply for: {offer.title}
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

        {/* Privacy Notice Alert */}
        <div style={{
          background: 'rgba(99, 102, 241, 0.08)',
          borderBottom: '1px solid rgba(99, 102, 241, 0.2)',
          padding: '12px 24px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          fontSize: '0.8rem',
          color: '#c7d2fe',
        }}>
          <ShieldCheck size={18} color="var(--accent-glow)" style={{ flexShrink: 0 }} />
          <div>
            <strong>Zero-Knowledge Guarantee:</strong> Your financial inputs remain strictly in your browser.
            Only a cryptographic proof of eligibility is broadcast to Midnight.
          </div>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Target Underwriting Reference */}
          <div style={{
            background: 'rgba(0,0,0,0.3)',
            borderRadius: 'var(--radius-sm)',
            padding: '12px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.82rem',
            border: '1px solid var(--border-subtle)',
          }}>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Req. Credit: </span>
              <span style={{ fontWeight: 600 }}>{offer.minCreditScore}+</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Req. Income: </span>
              <span style={{ fontWeight: 600 }}>${offer.minIncome.toLocaleString()}</span>
            </div>
            <div>
              <span style={{ color: 'var(--text-dim)' }}>Max DTI: </span>
              <span style={{ fontWeight: 600 }}>≤ {offer.maxDtiPercent}%</span>
            </div>
          </div>

          {/* Input 1: Credit Score */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Credit Score (FICO)
              </label>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: creditScore >= offer.minCreditScore ? '#10b981' : '#f43f5e',
              }}>
                {creditScore} {creditScore >= offer.minCreditScore ? '✓ Meets Criteria' : '✗ Below Threshold'}
              </span>
            </div>
            <input
              type="range"
              min="300"
              max="850"
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
              style={{ width: '100%', accentColor: 'var(--accent-primary)', marginBottom: '6px' }}
            />
            <input
              type="number"
              className="input-field"
              value={creditScore}
              onChange={(e) => setCreditScore(Number(e.target.value))}
              min="300"
              max="850"
              required
            />
          </div>

          {/* Input 2: Annual Income */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Gross Annual Income ($ USD)
              </label>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: annualIncome >= offer.minIncome ? '#10b981' : '#f43f5e',
              }}>
                {annualIncome >= offer.minIncome ? '✓ Meets Criteria' : '✗ Below Threshold'}
              </span>
            </div>
            <input
              type="number"
              className="input-field"
              value={annualIncome}
              onChange={(e) => setAnnualIncome(Number(e.target.value))}
              min="1000"
              step="1000"
              required
            />
          </div>

          {/* Input 3: Monthly Debt */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                Total Monthly Debt Payments ($ USD)
              </label>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 700,
                color: Number(calculatedDti) <= offer.maxDtiPercent ? '#10b981' : '#f43f5e',
              }}>
                DTI: {calculatedDti}% {Number(calculatedDti) <= offer.maxDtiPercent ? '✓ Acceptable' : '✗ Exceeds Max'}
              </span>
            </div>
            <input
              type="number"
              className="input-field"
              value={monthlyDebt}
              onChange={(e) => setMonthlyDebt(Number(e.target.value))}
              min="0"
              step="50"
              placeholder="e.g. 1200 (credit cards, auto loans, etc.)"
              required
            />
          </div>

          {/* Secret Salt */}
          <div style={{
            background: 'rgba(0, 0, 0, 0.2)',
            padding: '12px 14px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase' }}>
                Cryptographic Blinding Factor (Salt)
              </span>
              <button
                type="button"
                onClick={() => setShowSecret(!showSecret)}
                style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.75rem' }}
              >
                {showSecret ? <EyeOff size={14} /> : <Eye size={14} />} {showSecret ? 'Hide' : 'Show'}
              </button>
            </div>
            <div className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-glow)' }}>
              {showSecret ? borrowerSecret : '••••••••••••••••••••••••••••••••'}
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '14px', fontSize: '1rem' }}>
            <Sparkles size={18} />
            Generate Zero-Knowledge Eligibility Proof
          </button>
        </form>
      </div>
    </div>
  );
};
