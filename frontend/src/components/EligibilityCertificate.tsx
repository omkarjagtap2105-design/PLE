import React from 'react';
import { CheckCircle2, XCircle, Copy, Check } from 'lucide-react';
import { VerificationResult } from '../types';

interface EligibilityCertificateProps {
  result: VerificationResult;
  onClose: () => void;
}

export const EligibilityCertificate: React.FC<EligibilityCertificateProps> = ({
  result,
  onClose,
}) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.borrowerCommitment);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className="modal-content"
        onClick={(e) => e.stopPropagation()}
        style={{
          maxWidth: '600px',
          border: `1px solid ${result.isEligible ? 'rgba(16, 185, 129, 0.4)' : 'rgba(244, 63, 94, 0.4)'}`,
          boxShadow: result.isEligible ? 'var(--shadow-emerald)' : 'var(--shadow-rose)',
        }}
      >
        {/* Certificate Banner */}
        <div style={{
          padding: '32px 24px',
          textAlign: 'center',
          background: result.isEligible
            ? 'linear-gradient(180deg, rgba(16, 185, 129, 0.15) 0%, transparent 100%)'
            : 'linear-gradient(180deg, rgba(244, 63, 94, 0.15) 0%, transparent 100%)',
          borderBottom: '1px solid var(--border-subtle)',
        }}>
          <div style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            background: result.isEligible ? 'rgba(16, 185, 129, 0.2)' : 'rgba(244, 63, 94, 0.2)',
            border: `2px solid ${result.isEligible ? '#10b981' : '#f43f5e'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            {result.isEligible ? (
              <CheckCircle2 size={36} color="#10b981" />
            ) : (
              <XCircle size={36} color="#f43f5e" />
            )}
          </div>

          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', marginBottom: '8px' }}>
            <span className={result.isEligible ? 'badge badge-success' : 'badge badge-danger'}>
              {result.isEligible ? 'On-Chain Verified' : 'Requirements Not Met'}
            </span>
          </div>

          <h2 className="font-display" style={{ fontSize: '1.75rem', fontWeight: 800, marginBottom: '6px' }}>
            {result.isEligible ? 'Eligible for Loan' : 'Ineligible for Loan'}
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
            {result.isEligible
              ? `Congratulations! You meet all underwriting requirements for ${result.loanTitle}.`
              : `Your private financial metrics do not satisfy the minimum criteria for ${result.loanTitle}.`}
          </p>
        </div>

        {/* Criteria Evaluation Breakdown */}
        <div style={{ padding: '24px' }}>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '12px', fontWeight: 600 }}>
            Underwriting Rules Checked (In Zero Knowledge)
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '24px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.85rem' }}>FICO Credit Score Requirement</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: result.rulesEvaluated.creditScorePassed ? '#10b981' : '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {result.rulesEvaluated.creditScorePassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {result.rulesEvaluated.creditScorePassed ? 'Threshold Satisfied' : 'Failed'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.85rem' }}>Minimum Annual Income Requirement</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: result.rulesEvaluated.incomePassed ? '#10b981' : '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {result.rulesEvaluated.incomePassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {result.rulesEvaluated.incomePassed ? 'Threshold Satisfied' : 'Failed'}
              </span>
            </div>

            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '10px 14px',
              background: 'rgba(0,0,0,0.2)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid var(--border-subtle)',
            }}>
              <span style={{ fontSize: '0.85rem' }}>Maximum Debt-to-Income (DTI) Ratio</span>
              <span style={{
                fontSize: '0.85rem',
                fontWeight: 600,
                color: result.rulesEvaluated.dtiPassed ? '#10b981' : '#f43f5e',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                {result.rulesEvaluated.dtiPassed ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {result.rulesEvaluated.dtiPassed ? 'Threshold Satisfied' : 'Failed'}
              </span>
            </div>
          </div>

          {/* Minimal Disclosure Proof Data */}
          <div style={{
            background: 'rgba(15, 23, 42, 0.9)',
            border: '1px solid var(--border-accent)',
            borderRadius: 'var(--radius-sm)',
            padding: '16px',
            marginBottom: '24px',
          }}>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', marginBottom: '8px' }}>
              Minimal Necessary Disclosure (Recorded on Ledger)
            </div>

            <div style={{ marginBottom: '10px' }}>
              <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>Cryptographic Commitment (SHA-256):</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '2px' }}>
                <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--accent-glow)', wordBreak: 'break-all' }}>
                  {result.borrowerCommitment}
                </span>
                <button
                  onClick={handleCopy}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', flexShrink: 0 }}
                >
                  {copied ? <Check size={14} color="#10b981" /> : <Copy size={14} />}
                </button>
              </div>
            </div>

            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <span style={{ color: 'var(--text-muted)' }}>Midnight Preprod Tx:</span>
              <span className="font-mono" style={{ color: 'var(--text-main)' }}>
                {result.txHash}
              </span>
            </div>
          </div>

          <button onClick={onClose} className="btn-primary" style={{ width: '100%', padding: '12px' }}>
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
