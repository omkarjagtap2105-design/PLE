import React, { useState } from 'react';
import { Header } from './components/Header';
import { LoanMarketplace } from './components/LoanMarketplace';
import { WalletModal } from './components/WalletModal';
import { CreateLoanModal } from './components/CreateLoanModal';
import { BorrowerModal } from './components/BorrowerModal';
import { ProofStepperModal } from './components/ProofStepperModal';
import { EligibilityCertificate } from './components/EligibilityCertificate';
import { PrivacyModelDrawer } from './components/PrivacyModelDrawer';
import { Footer } from './components/Footer';
import { LoanOffer, WalletState, BorrowerPrivateData, VerificationResult } from './types';
import { ZkProverService } from './services/zkProver';
import { Shield, Sparkles, Lock, ArrowRight, Zap, CheckCircle2 } from 'lucide-react';

const INITIAL_OFFERS: LoanOffer[] = [
  {
    id: 'loan_prime_mortgage_30y',
    title: 'Prime 30-Year Fixed Mortgage',
    category: 'Mortgage',
    amount: 450000,
    interestRate: 5.75,
    minCreditScore: 700,
    minIncome: 75000,
    maxDtiPercent: 43,
    lenderName: 'Aegis Home Lending',
    lenderAddress: 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm',
    active: true,
  },
  {
    id: 'loan_eco_auto_clean',
    title: 'Eco Clean Mobility Auto Loan',
    category: 'Auto Loan',
    amount: 45000,
    interestRate: 4.25,
    minCreditScore: 660,
    minIncome: 40000,
    maxDtiPercent: 45,
    lenderName: 'Verdant Credit Union',
    lenderAddress: 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm',
    active: true,
  },
  {
    id: 'loan_tech_sme_growth',
    title: 'Web3 & Tech SME Working Capital',
    category: 'Business',
    amount: 150000,
    interestRate: 7.1,
    minCreditScore: 680,
    minIncome: 100000,
    maxDtiPercent: 38,
    lenderName: 'Midnight Growth Ventures',
    lenderAddress: 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm',
    active: true,
  },
  {
    id: 'loan_flexible_personal',
    title: 'Flexible Unsecured Personal Credit',
    category: 'Personal',
    amount: 20000,
    interestRate: 8.4,
    minCreditScore: 640,
    minIncome: 35000,
    maxDtiPercent: 50,
    lenderName: 'Horizon Financial',
    lenderAddress: 'mn_addr_preprod1qspsyhvzyt7y6k5qfwcucz822yauqluzx77982l4n6rrgwddwrzshrvxxm',
    active: true,
  },
];

export const App: React.FC = () => {
  const [wallet, setWallet] = useState<WalletState>({
    connected: false,
    address: null,
    network: 'Midnight Preprod',
    balanceDust: 0,
    balanceTnight: 0,
    isConnecting: false,
    error: null,
    connector: '1am',
  });

  const [offers, setOffers] = useState<LoanOffer[]>(INITIAL_OFFERS);
  const [selectedOffer, setSelectedOffer] = useState<LoanOffer | null>(null);

  // Modals state
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const [isCreateLoanModalOpen, setIsCreateLoanModalOpen] = useState(false);
  const [isBorrowerModalOpen, setIsBorrowerModalOpen] = useState(false);
  const [isPrivacyDrawerOpen, setIsPrivacyDrawerOpen] = useState(false);

  // Proof generation state
  const [isProving, setIsProving] = useState(false);
  const [provingStep, setProvingStep] = useState(0);
  const [provingLog, setProvingLog] = useState('');
  const [verificationResult, setVerificationResult] = useState<VerificationResult | null>(null);

  const handleSelectLoan = (offer: LoanOffer) => {
    setSelectedOffer(offer);
    setIsBorrowerModalOpen(true);
  };

  const handleCreateLoan = (newOffer: LoanOffer) => {
    setOffers((prev) => [newOffer, ...prev]);
  };

  const handleExecuteProof = async (privateData: BorrowerPrivateData) => {
    if (!selectedOffer) return;
    if (!wallet.connected || !wallet.address) {
      alert('Please connect your 1AM wallet first to generate a real proof.');
      setIsBorrowerModalOpen(false);
      return;
    }
    setIsBorrowerModalOpen(false);
    setIsProving(true);
    setProvingStep(0);
    setProvingLog('Initializing witness sandbox...');

    try {
      const borrowerId = wallet.address;
      const result = await ZkProverService.executeProof(
        selectedOffer,
        borrowerId,
        privateData,
        (stepIndex, log) => {
          setProvingStep(stepIndex);
          setProvingLog(log);
        }
      );

      setVerificationResult(result);
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Proof generation failed');
    } finally {
      setIsProving(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Header
        wallet={wallet}
        onOpenWalletModal={() => setIsWalletModalOpen(true)}
        onOpenCreateLoan={() => setIsCreateLoanModalOpen(true)}
        onOpenPrivacyModel={() => setIsPrivacyDrawerOpen(true)}
      />

      <main style={{ flex: 1 }}>
        {/* Hero Section */}
        <section style={{
          maxWidth: '1240px',
          margin: '0 auto',
          padding: '80px 24px 40px',
          textAlign: 'center',
        }}>
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'rgba(99, 102, 241, 0.1)',
            border: '1px solid var(--border-accent)',
            padding: '6px 16px',
            borderRadius: 'var(--radius-full)',
            marginBottom: '20px',
          }}>
            <Sparkles size={16} color="var(--accent-glow)" />
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--accent-glow)' }}>
              Zero-Knowledge Underwriting on Midnight
            </span>
          </div>

          <h1 className="font-display" style={{
            fontSize: 'clamp(2.4rem, 5vw, 3.8rem)',
            fontWeight: 800,
            lineHeight: 1.1,
            maxWidth: '920px',
            margin: '0 auto 20px',
            background: 'linear-gradient(180deg, #ffffff 30%, #94a3b8 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Prove Loan Eligibility Without Exposing Your Financial Records
          </h1>

          <p style={{
            fontSize: 'clamp(1.05rem, 2vw, 1.2rem)',
            color: 'var(--text-muted)',
            maxWidth: '720px',
            margin: '0 auto 36px',
            lineHeight: 1.6,
          }}>
            Qualify for mortgages, auto loans, and commercial credit against institutional criteria using Zero-Knowledge proofs.
            Your income, credit score, and debt obligations never leave your device.
          </p>

          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <button
              onClick={() => {
                const el = document.getElementById('marketplace-anchor');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="btn-primary"
              style={{ padding: '14px 28px', fontSize: '1rem' }}
            >
              <span>Explore Loan Offers</span>
              <ArrowRight size={18} />
            </button>

            <button
              onClick={() => setIsPrivacyDrawerOpen(true)}
              className="btn-secondary"
              style={{ padding: '14px 24px', fontSize: '1rem' }}
            >
              <Lock size={18} />
              <span>How Privacy Works</span>
            </button>
          </div>

          {/* Feature Highlights Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '20px',
            marginTop: '60px',
            textAlign: 'left',
          }}>
            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(99, 102, 241, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Shield size={20} color="var(--accent-glow)" />
              </div>
              <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                100% Private Witness
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Exact salary, FICO score, and monthly credit balances remain strictly within your local prover memory.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(16, 185, 129, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <Zap size={20} color="#10b981" />
              </div>
              <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                Compact Smart Contract
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Mathematical Debt-to-Income and threshold circuits evaluated on Midnight Network with zero precision loss.
              </p>
            </div>

            <div className="glass-panel" style={{ padding: '24px' }}>
              <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'rgba(6, 182, 212, 0.15)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '14px' }}>
                <CheckCircle2 size={20} color="#06b6d4" />
              </div>
              <h4 className="font-display" style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '6px' }}>
                Minimal Disclosure
              </h4>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                Only the boolean qualification receipt is published on-chain. Lenders verify eligibility without invasive audits.
              </p>
            </div>
          </div>
        </section>

        {/* Loan Products Marketplace */}
        <div id="marketplace-anchor">
          <LoanMarketplace offers={offers} onSelectLoan={handleSelectLoan} />
        </div>
      </main>

      <Footer />

      {/* Modals */}
      {isWalletModalOpen && (
        <WalletModal
          wallet={wallet}
          onClose={() => setIsWalletModalOpen(false)}
          onWalletUpdated={(st) => setWallet(st)}
        />
      )}

      {isCreateLoanModalOpen && (
        <CreateLoanModal
          onClose={() => setIsCreateLoanModalOpen(false)}
          onLoanCreated={handleCreateLoan}
          lenderAddress={wallet.address || ''}
        />
      )}

      {isBorrowerModalOpen && selectedOffer && (
        <BorrowerModal
          offer={selectedOffer}
          onClose={() => setIsBorrowerModalOpen(false)}
          onSubmitProof={handleExecuteProof}
        />
      )}

      {isProving && (
        <ProofStepperModal
          currentStepIndex={provingStep}
          logMessage={provingLog}
        />
      )}

      {verificationResult && (
        <EligibilityCertificate
          result={verificationResult}
          onClose={() => setVerificationResult(null)}
        />
      )}

      {isPrivacyDrawerOpen && (
        <PrivacyModelDrawer onClose={() => setIsPrivacyDrawerOpen(false)} />
      )}
    </div>
  );
};
export default App;
