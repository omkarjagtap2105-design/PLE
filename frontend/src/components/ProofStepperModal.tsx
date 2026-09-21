import React from 'react';
import { Loader2, CheckCircle, Clock, ShieldCheck } from 'lucide-react';

interface ProofStepperModalProps {
  currentStepIndex: number;
  logMessage: string;
}

const STEPS_CONFIG: { title: string; description: string }[] = [
  {
    title: 'Initialize Private Witness',
    description: 'Loading credit score, income, and debt into local sandboxed memory.',
  },
  {
    title: 'Commitment & Underwriting Circuit',
    description: 'Evaluating Compact circuit rules and generating SHA-256 persistent commitment.',
  },
  {
    title: 'Synthesize Zero-Knowledge Proof',
    description: 'Generating zk-SNARK cryptographic proof without exposing witness values.',
  },
  {
    title: 'Midnight Preprod Confirmation',
    description: 'Broadcasting balanced transaction to Midnight Preprod testnet.',
  },
];

export const ProofStepperModal: React.FC<ProofStepperModalProps> = ({
  currentStepIndex,
  logMessage,
}) => {
  return (
    <div className="modal-overlay">
      <div className="modal-content" style={{ maxWidth: '520px', padding: '28px' }}>
        {/* Title */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{
            width: '56px',
            height: '56px',
            borderRadius: '50%',
            background: 'rgba(99, 102, 241, 0.15)',
            border: '1px solid var(--border-accent)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 25px rgba(99, 102, 241, 0.3)',
          }}>
            <ShieldCheck size={28} color="var(--accent-glow)" />
          </div>
          <h3 className="font-display" style={{ fontSize: '1.4rem', fontWeight: 700, marginBottom: '6px' }}>
            Zero-Knowledge Verification
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
            Proving loan qualification on Midnight Network
          </p>
        </div>

        {/* Stepper Timeline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginBottom: '28px' }}>
          {STEPS_CONFIG.map((step, idx) => {
            const isCompleted = currentStepIndex > idx;
            const isCurrent = currentStepIndex === idx;

            return (
              <div key={idx} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  background: isCompleted
                    ? 'rgba(16, 185, 129, 0.2)'
                    : isCurrent
                    ? 'rgba(99, 102, 241, 0.2)'
                    : 'rgba(255, 255, 255, 0.05)',
                  border: `1px solid ${
                    isCompleted
                      ? '#10b981'
                      : isCurrent
                      ? 'var(--accent-primary)'
                      : 'var(--border-subtle)'
                  }`,
                }}>
                  {isCompleted ? (
                    <CheckCircle size={18} color="#10b981" />
                  ) : isCurrent ? (
                    <Loader2 size={18} color="var(--accent-glow)" className="animate-spin" style={{ animation: 'spin 1.2s linear infinite' }} />
                  ) : (
                    <Clock size={16} color="var(--text-dim)" />
                  )}
                </div>

                <div>
                  <div style={{
                    fontSize: '0.95rem',
                    fontWeight: 600,
                    color: isCompleted ? '#ffffff' : isCurrent ? 'var(--accent-glow)' : 'var(--text-dim)',
                  }}>
                    {step.title}
                  </div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '2px' }}>
                    {step.description}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Live Terminal Log */}
        <div style={{
          background: 'rgba(0, 0, 0, 0.5)',
          borderRadius: 'var(--radius-sm)',
          padding: '12px 16px',
          border: '1px solid var(--border-subtle)',
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
        }}>
          <div style={{
            width: '6px',
            height: '6px',
            borderRadius: '50%',
            background: 'var(--accent-primary)',
            boxShadow: '0 0 8px var(--accent-primary)',
          }} />
          <span className="font-mono" style={{ fontSize: '0.78rem', color: 'var(--text-main)', wordBreak: 'break-all' }}>
            {logMessage || 'Processing ZK circuit constraints...'}
          </span>
        </div>
      </div>
    </div>
  );
};
