import React, { useState } from 'react';
import { X, PlusCircle, Building2, AlertCircle } from 'lucide-react';
import { LoanOffer } from '../types';

interface CreateLoanModalProps {
  onClose: () => void;
  onLoanCreated: (newOffer: LoanOffer) => void;
  lenderAddress: string;
}

export const CreateLoanModal: React.FC<CreateLoanModalProps> = ({
  onClose,
  onLoanCreated,
  lenderAddress,
}) => {
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'Mortgage' | 'Auto Loan' | 'Personal' | 'Business'>('Personal');
  const [amount, setAmount] = useState(25000);
  const [interestRate, setInterestRate] = useState(6.5);
  const [minCreditScore, setMinCreditScore] = useState(680);
  const [minIncome, setMinIncome] = useState(50000);
  const [maxDtiPercent, setMaxDtiPercent] = useState(40);
  const [lenderName, setLenderName] = useState('Midnight Capital Partners');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Please provide a loan product title.');
      return;
    }
    if (minCreditScore < 300 || minCreditScore > 850) {
      setError('Minimum credit score must be between 300 and 850.');
      return;
    }
    if (minIncome <= 0) {
      setError('Minimum annual income must be greater than $0.');
      return;
    }
    if (maxDtiPercent <= 0 || maxDtiPercent > 100) {
      setError('Maximum DTI must be between 1% and 100%.');
      return;
    }

    const newOffer: LoanOffer = {
      id: `loan_${Date.now()}`,
      title: title.trim(),
      category,
      amount,
      interestRate,
      minCreditScore,
      minIncome,
      maxDtiPercent,
      lenderName: lenderName.trim(),
      lenderAddress: lenderAddress || 'mn_addr_preprod_lender_default',
      active: true,
    };

    onLoanCreated(newOffer);
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '540px' }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px',
          borderBottom: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Building2 size={20} color="var(--accent-glow)" />
            <h3 className="font-display" style={{ fontSize: '1.2rem', fontWeight: 700 }}>
              Create Loan Product (Lender)
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

        {/* Form Body */}
        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
          {error && (
            <div style={{
              background: 'rgba(244, 63, 94, 0.12)',
              border: '1px solid rgba(244, 63, 94, 0.3)',
              borderRadius: 'var(--radius-sm)',
              padding: '10px 14px',
              fontSize: '0.85rem',
              color: '#fda4af',
              display: 'flex',
              gap: '8px',
            }}>
              <AlertCircle size={16} style={{ flexShrink: 0, marginTop: '2px' }} />
              <div>{error}</div>
            </div>
          )}

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px', color: 'var(--text-main)' }}>
              Loan Product Title
            </label>
            <input
              type="text"
              className="input-field"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Prime Fixed 30-Year Mortgage"
              required
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Category
              </label>
              <select
                className="input-field"
                value={category}
                onChange={(e) => setCategory(e.target.value as any)}
              >
                <option value="Mortgage">Mortgage</option>
                <option value="Auto Loan">Auto Loan</option>
                <option value="Personal">Personal</option>
                <option value="Business">Business</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Lender Name
              </label>
              <input
                type="text"
                className="input-field"
                value={lenderName}
                onChange={(e) => setLenderName(e.target.value)}
                required
              />
            </div>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Principal Amount ($)
              </label>
              <input
                type="number"
                className="input-field"
                value={amount}
                onChange={(e) => setAmount(Number(e.target.value))}
                min="1000"
                step="500"
                required
              />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '6px' }}>
                Interest Rate (APR %)
              </label>
              <input
                type="number"
                className="input-field"
                value={interestRate}
                onChange={(e) => setInterestRate(Number(e.target.value))}
                min="0.1"
                max="35"
                step="0.1"
                required
              />
            </div>
          </div>

          <div style={{
            background: 'rgba(0, 0, 0, 0.3)',
            padding: '16px',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent-glow)', marginBottom: '12px', textTransform: 'uppercase' }}>
              Institutional Underwriting Criteria
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Min Credit Score
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={minCreditScore}
                  onChange={(e) => setMinCreditScore(Number(e.target.value))}
                  min="300"
                  max="850"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Min Income ($/yr)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={minIncome}
                  onChange={(e) => setMinIncome(Number(e.target.value))}
                  min="1000"
                  step="1000"
                  required
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                  Max DTI (%)
                </label>
                <input
                  type="number"
                  className="input-field"
                  value={maxDtiPercent}
                  onChange={(e) => setMaxDtiPercent(Number(e.target.value))}
                  min="1"
                  max="100"
                  required
                />
              </div>
            </div>
          </div>

          <button type="submit" className="btn-primary" style={{ padding: '12px', marginTop: '6px' }}>
            <PlusCircle size={18} />
            Publish Loan Underwriting Terms
          </button>
        </form>
      </div>
    </div>
  );
};
