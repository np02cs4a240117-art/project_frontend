import React, { useEffect, useMemo, useState } from 'react';
import { Radio, RefreshCw, Smartphone, Wifi, Wallet } from 'lucide-react';
import Layout from '../components/Layout';
import { ncellService } from '../services/ncell.service';
import { useNotification } from '../context/NotificationContext';
import { useAuth } from '../context/AuthContext';
import SuccessModal from '../components/SuccessModal';

const EMPTY_CATALOG = { data: [], voice: [] };

const NcellPage = () => {
  const { user, refreshUser } = useAuth();
  const { showNotification } = useNotification();
  const [catalog, setCatalog] = useState(EMPTY_CATALOG);
  const [loadingCatalog, setLoadingCatalog] = useState(true);
  const [activeCategory, setActiveCategory] = useState('data');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [selectedAmount, setSelectedAmount] = useState(null);
  const [otpCode, setOtpCode] = useState('');
  const [otpToken, setOtpToken] = useState('');
  const [redirectUrl, setRedirectUrl] = useState('');
  const [sendingOtp, setSendingOtp] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const availableBalance = Number(user?.balance || 0);

  const packs = catalog[activeCategory] || [];
  const selectedPack = useMemo(
    () => packs.find((pack) => pack.amount === selectedAmount) || null,
    [packs, selectedAmount]
  );
  const hasEnoughBalance = selectedPack ? availableBalance >= Number(selectedPack.amount) : false;

  const loadCatalog = async () => {
    setLoadingCatalog(true);
    try {
      const response = await ncellService.getPacks();
      setCatalog(response?.data || EMPTY_CATALOG);
    } catch {
      setCatalog(EMPTY_CATALOG);
    } finally {
      setLoadingCatalog(false);
    }
  };

  useEffect(() => {
    loadCatalog();
  }, []);

  useEffect(() => {
    setSelectedAmount((current) => {
      if (!packs.some((pack) => pack.amount === current)) {
        return packs[0]?.amount ?? null;
      }
      return current;
    });
  }, [packs]);

  const resetOtpSession = () => {
    setOtpToken('');
    setOtpCode('');
    setRedirectUrl('');
  };

  const handleCategoryChange = (category) => {
    setActiveCategory(category);
    resetOtpSession();
  };

  const handlePhoneChange = (event) => {
    setPhoneNumber(event.target.value.replace(/\D/g, '').slice(0, 10));
    resetOtpSession();
  };

  const handlePackSelect = (amount) => {
    setSelectedAmount(amount);
    resetOtpSession();
  };

  const handleSendOtp = async (event) => {
    event.preventDefault();
    if (!selectedPack) {
      showNotification('Select a pack first.', 'warning');
      return;
    }

    setSendingOtp(true);
    try {
      const response = await ncellService.sendOtp({
        phone_number: phoneNumber,
        pack_type: activeCategory,
        amount: selectedPack.amount,
      });

      setOtpToken(response.token || '');
      setRedirectUrl('');
      showNotification(`OTP sent to ${response.phoneNumber}.`, 'success');
    } catch {
      setOtpToken('');
    } finally {
      setSendingOtp(false);
    }
  };

  const handleConfirmPurchase = async (event) => {
    event.preventDefault();
    if (!selectedPack || !otpToken) {
      showNotification('Send OTP first.', 'warning');
      return;
    }

    setConfirming(true);
    try {
      const response = await ncellService.confirmPurchase({
        phone_number: phoneNumber,
        pack_type: activeCategory,
        amount: selectedPack.amount,
        token: otpToken,
        otp_code: otpCode,
      });

      setRedirectUrl('');
      setSuccessMessage(
        `${selectedPack.title} purchased successfully and saved to transfer history as Ncell Datapack${response.providerTransactionId ? ` (${response.providerTransactionId})` : ''}.`
      );
      setShowSuccess(true);
      await refreshUser();
      showNotification('Ncell pack purchased successfully.', 'success');
    } catch {
      setRedirectUrl('');
    } finally {
      setConfirming(false);
    }
  };

  return (
    <Layout>
      <SuccessModal isOpen={showSuccess} message={successMessage} onClose={() => setShowSuccess(false)} />
      <div className="section-title">
        <div>
          <h2>Ncell Packs</h2>
          <p>Buy Ncell data and voice packs.</p>
        </div>
      </div>

      <div className="service-card ncell-hero-card">
        <div className="ncell-hero-top">
          <div>
            <div className="ncell-kicker">Telecom Top-up</div>
            <h3>Buy Ncell Data and Voice Packs</h3>
            <p>Enter a number, pick a pack, and verify with OTP.</p>
          </div>
          <div className="ncell-badge">
            <Smartphone size={18} />
            Ncell
          </div>
        </div>
      </div>

      <div className="service-card">
        <div className="planner-strip-head">
          <h4>Available Balance</h4>
          <div className="ncell-balance-pill">
            <Wallet size={16} />
            NPR {availableBalance.toFixed(2)}
          </div>
        </div>
        {selectedPack && !hasEnoughBalance ? (
          <p className="error-message" style={{ marginBottom: 0 }}>
            You need NPR {Number(selectedPack.amount).toFixed(2)} in your account to buy this pack.
          </p>
        ) : (
          <p className="planner-muted">Your Expenser balance is enough for the currently selected pack.</p>
        )}
      </div>

      <div className="planner-tabs">
        <button
          type="button"
          className={`planner-tab ${activeCategory === 'data' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('data')}
        >
          <Wifi size={16} />
          Data Packs
        </button>
        <button
          type="button"
          className={`planner-tab ${activeCategory === 'voice' ? 'active' : ''}`}
          onClick={() => handleCategoryChange('voice')}
        >
          <Radio size={16} />
          Voice Packs
        </button>
      </div>

      <div className="service-card">
        <form onSubmit={handleSendOtp} className="ncell-form-grid">
          <div className="form-group">
            <label>Ncell Number</label>
            <input
              className="input-field"
              placeholder="98XXXXXXXX"
              value={phoneNumber}
              onChange={handlePhoneChange}
              inputMode="numeric"
            />
          </div>

          <div className="ncell-action-row">
            <button type="button" className="btn btn-ghost" onClick={loadCatalog} disabled={loadingCatalog}>
              <RefreshCw size={16} className={loadingCatalog ? 'spin-icon' : ''} />
              Refresh Packs
            </button>
            <button type="submit" className="btn btn-primary" disabled={sendingOtp || loadingCatalog || !hasEnoughBalance}>
              {sendingOtp ? 'Sending OTP...' : 'Send OTP'}
            </button>
          </div>
        </form>

        <div className="ncell-pack-grid">
          {packs.map((pack) => (
            <button
              key={`${activeCategory}-${pack.amount}-${pack.slug}`}
              type="button"
              className={`ncell-pack-card ${selectedAmount === pack.amount ? 'active' : ''}`}
              onClick={() => handlePackSelect(pack.amount)}
            >
              <span className="ncell-pack-price">Rs {pack.amount}</span>
              <strong>{pack.title}</strong>
              <small>{pack.slug}</small>
            </button>
          ))}
        </div>

        {!loadingCatalog && packs.length === 0 && (
          <div className="planner-empty">
            <h3>No packs available</h3>
            <p>Try refreshing the catalog and make sure the backend is running.</p>
          </div>
        )}
      </div>

      <div className="service-card">
        <div className="planner-strip-head">
          <h4>Verify OTP</h4>
          {selectedPack ? <span className="planner-muted">{selectedPack.title}</span> : null}
        </div>

        <form onSubmit={handleConfirmPurchase} className="ncell-form-grid">
          <div className="form-group">
            <label>OTP Code</label>
            <input
              className="input-field"
              placeholder="123456"
              value={otpCode}
              onChange={(event) => setOtpCode(event.target.value.replace(/\D/g, '').slice(0, 6))}
              inputMode="numeric"
            />
          </div>

          <div className="ncell-action-row">
            <button type="submit" className="btn btn-primary" disabled={confirming || !otpToken || !hasEnoughBalance}>
              {confirming ? 'Verifying...' : 'Verify OTP'}
            </button>
          </div>
        </form>

        <div className="ncell-status-box">
          <p>{otpToken ? 'OTP session is active. Enter the code to continue.' : 'Send OTP first to activate the verification step.'}</p>
        </div>
      </div>
    </Layout>
  );
};

export default NcellPage;
