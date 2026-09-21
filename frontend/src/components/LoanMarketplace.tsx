import React, { useState } from 'react';
import { ShieldCheck, Percent, DollarSign, Award, ChevronRight, Lock } from 'lucide-react';
import { LoanOffer } from '../types';

interface LoanMarketplaceProps {
  offers: LoanOffer[];
  onSelectLoan: (offer: LoanOffer) => void;
}

export const LoanMarketplace: React.FC<LoanMarketplaceProps> = ({
  offers,
  onSelectLoan,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const categories = ['All', 'Mortgage', 'Auto Loan', 'Personal', 'Business'];

  const filteredOffers = selectedCategory === 'All'
    ? offers
    : offers.filter((o) => o.category === selectedCategory);

  return (
    <section style={{ maxWidth: '1240px', margin: '40px auto', padding: '0 24px' }}>
      {/* Section Header */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '32px',
        flexWrap: 'wrap',
        gap: '20px',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span className="badge badge-privacy">
              <Lock size={12} /> Zero-Knowledge Underwriting
            </span>
          </div>
          <h2 className="font-display" style={{ fontSize: '2rem', fontWeight: 800 }}>
            Available Loan Products
          </h2>
          <p style={{ color: 'var(--text-muted)', fontSize: '1rem', marginTop: '4px' }}>
            Prove qualification against institutional underwriting criteria without disclosing your actual income or credit score.
          </p>
        </div>

        {/* Category Filter */}
        <div style={{
          display: 'flex',
          gap: '8px',
          background: 'rgba(15, 23, 42, 0.6)',
          padding: '6px',
          borderRadius: 'var(--radius-sm)',
          border: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}>
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              style={{
                background: selectedCategory === cat ? 'var(--accent-primary)' : 'transparent',
                color: selectedCategory === cat ? '#ffffff' : 'var(--text-muted)',
                border: 'none',
                borderRadius: '6px',
                padding: '6px 14px',
                fontSize: '0.85rem',
                fontWeight: 600,
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Loan Offers */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(360px, 1fr))',
        gap: '24px',
      }}>
        {filteredOffers.map((offer) => (
          <div
            key={offer.id}
            className="glass-panel"
            style={{
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              transition: 'transform 0.2s, border-color 0.2s, box-shadow 0.2s',
              position: 'relative',
              overflow: 'hidden',
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = 'translateY(-4px)';
              e.currentTarget.style.borderColor = 'var(--border-accent)';
              e.currentTarget.style.boxShadow = 'var(--shadow-glow)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = 'translateY(0)';
              e.currentTarget.style.borderColor = 'var(--border-subtle)';
              e.currentTarget.style.boxShadow = 'var(--shadow-subtle)';
            }}
          >
            <div>
              {/* Header */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                <span className="badge badge-network" style={{ fontSize: '0.7rem' }}>
                  {offer.category}
                </span>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-dim)', fontWeight: 500 }}>
                  {offer.lenderName}
                </span>
              </div>

              {/* Title & Amount */}
              <h3 className="font-display" style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: '8px' }}>
                {offer.title}
              </h3>

              <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', marginBottom: '20px' }}>
                <span style={{ fontSize: '1.75rem', fontWeight: 800, color: 'var(--text-main)' }}>
                  ${offer.amount.toLocaleString()}
                </span>
                <span style={{ color: 'var(--accent-glow)', fontSize: '0.9rem', fontWeight: 600 }}>
                  @ {offer.interestRate}% APR
                </span>
              </div>

              {/* Underwriting Criteria Breakdown */}
              <div style={{
                background: 'rgba(0, 0, 0, 0.25)',
                borderRadius: 'var(--radius-sm)',
                padding: '14px',
                marginBottom: '24px',
                border: '1px solid rgba(255, 255, 255, 0.04)',
              }}>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: '10px' }}>
                  Public Underwriting Criteria
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Award size={14} color="var(--accent-violet)" /> Min Credit Score
                    </span>
                    <span style={{ fontWeight: 600 }}>{offer.minCreditScore}+ FICO</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <DollarSign size={14} color="#10b981" /> Min Annual Income
                    </span>
                    <span style={{ fontWeight: 600 }}>${offer.minIncome.toLocaleString()}/yr</span>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Percent size={14} color="#06b6d4" /> Max Debt-to-Income
                    </span>
                    <span style={{ fontWeight: 600 }}>≤ {offer.maxDtiPercent}% DTI</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Verification CTA */}
            <button
              onClick={() => onSelectLoan(offer)}
              className="btn-primary"
              style={{ width: '100%', justifyContent: 'space-between' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <ShieldCheck size={18} />
                <span>Verify Private Eligibility</span>
              </div>
              <ChevronRight size={16} />
            </button>
          </div>
        ))}
      </div>
    </section>
  );
};
