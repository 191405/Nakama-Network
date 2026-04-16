import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Loader2, Mail, Lock, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMessage, login, register, forgotPassword } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [resetSent, setResetSent] = useState(false);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode('login');
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setResetSent(false);
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) { setError('Please fill in all fields'); return; }
    try {
      setLoading(true); setError('');
      await login(email, password);
      setLoading(false);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Login failed. Please try again.');
      setLoading(false);
    }
  };

  const handleSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    const displayName = email.split('@')[0];
    try {
      setLoading(true); setError('');
      await register(email, password, displayName);
      setLoading(false);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleForgot = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    try {
      setLoading(true); setError('');
      await forgotPassword(email);
      setResetSent(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to send reset email.');
      setLoading(false);
    }
  };

  const tabStyle = (active) => ({
    background: active ? 'linear-gradient(135deg, #b76e79, #8c3343)' : 'transparent',
    color: active ? '#fff' : '#64748b',
    boxShadow: active ? '0 4px 15px rgba(183,110,121,0.35)' : 'none',
  });

  return (
    <div
      onClick={closeAuthModal}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 99999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
        background: 'rgba(5,5,5,0.85)',
        backdropFilter: 'blur(12px)',
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          position: 'relative',
          width: '100%',
          maxWidth: '380px',
          borderRadius: '24px',
          padding: '2rem',
          background: 'rgba(10, 10, 10, 0.95)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.9)',
        }}
      >
        {/* Close */}
        <button
          onClick={closeAuthModal}
          style={{
            position: 'absolute', top: '1rem', right: '1rem',
            background: 'rgba(255,255,255,0.05)', border: 'none',
            borderRadius: '50%', padding: '8px', cursor: 'pointer',
            color: '#999', zIndex: 50,
          }}
        >
          <X size={16} />
        </button>

        {/* Shimmer */}
        <div style={{
          position: 'absolute', top: 0, left: '25%', right: '25%', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(183,110,121,0.5), transparent)',
        }} />

        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            width: '48px', height: '48px', borderRadius: '16px', marginBottom: '1rem',
            background: 'linear-gradient(135deg, rgba(183,110,121,0.1), rgba(183,110,121,0.05))',
            border: '1px solid rgba(183,110,121,0.2)',
          }}>
            <Sparkles size={20} style={{ color: '#b76e79' }} />
          </div>
          {authModalMessage && (
            <p style={{ color: '#b76e79', fontSize: '14px', fontWeight: 500, marginBottom: '8px' }}>
              {authModalMessage}
            </p>
          )}
          <h2 style={{ color: '#fff', fontSize: '20px', fontWeight: 900, fontFamily: 'var(--font-display)' }}>
            Join the Network
          </h2>
        </div>

        {/* Tab bar for login/signup */}
        {(mode === 'login' || mode === 'signup') && (
          <div style={{
            display: 'flex', padding: '4px', borderRadius: '16px', marginBottom: '1rem',
            background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
          }}>
            <button type="button" onClick={() => { setMode('login'); setError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s', ...tabStyle(mode === 'login') }}>
              Sign In
            </button>
            <button type="button" onClick={() => { setMode('signup'); setError(''); }}
              style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '14px', fontWeight: 600, border: 'none', cursor: 'pointer', transition: 'all 0.3s', ...tabStyle(mode === 'signup') }}>
              Create Account
            </button>
          </div>
        )}

        {/* Login Form */}
        {mode === 'login' && (
          <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <div>
              <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px', paddingRight: '8px' }}>
                <button type="button" onClick={() => { setMode('forgot'); setError(''); setResetSent(false); }}
                  style={{ background: 'none', border: 'none', color: '#b76e79', fontSize: '12px', cursor: 'pointer' }}>
                  Forgot Password?
                </button>
              </div>
            </div>
            <SubmitBtn loading={loading}>Sign In</SubmitBtn>
          </form>
        )}

        {/* Signup Form */}
        {mode === 'signup' && (
          <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
            <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
              rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
            <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
            <SubmitBtn loading={loading}>Create Account <ArrowRight size={16} /></SubmitBtn>
          </form>
        )}

        {/* Forgot Password */}
        {mode === 'forgot' && (
          <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <p style={{ color: '#888', fontSize: '14px', textAlign: 'center', lineHeight: 1.6 }}>
              Enter your email and we'll send you a reset link.
            </p>
            {!resetSent ? (
              <>
                <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                <SubmitBtn loading={loading} disabled={!email}>Send Reset Link</SubmitBtn>
              </>
            ) : (
              <div style={{ padding: '16px', borderRadius: '12px', border: '1px solid rgba(34,197,94,0.2)', background: 'rgba(34,197,94,0.05)', textAlign: 'center' }}>
                <CheckCircle size={24} style={{ color: '#4ade80', margin: '0 auto 8px' }} />
                <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '14px' }}>Check Your Inbox</h4>
                <p style={{ color: '#888', fontSize: '12px' }}>Reset link sent to <strong style={{ color: '#4ade80' }}>{email}</strong></p>
              </div>
            )}
            <button type="button" onClick={() => setMode('login')}
              style={{ background: 'none', border: 'none', color: '#888', fontSize: '14px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '8px' }}>
              <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Sign In
            </button>
          </form>
        )}

        {/* Error */}
        {error && (
          <div style={{
            marginTop: '16px', padding: '12px', borderRadius: '16px', fontSize: '12px', textAlign: 'center',
            background: 'rgba(183,110,121,0.08)', border: '1px solid rgba(183,110,121,0.2)', color: '#e0bfb8',
          }}>
            {error}
          </div>
        )}

        {/* Bottom shimmer */}
        <div style={{
          position: 'absolute', bottom: 0, left: '25%', right: '25%', height: '1px',
          background: 'linear-gradient(to right, transparent, rgba(183,110,121,0.2), transparent)',
        }} />
      </div>
    </div>
  );
};

/* ── Reusable sub-components ── */

const InputField = ({ icon, rightIcon, onRightClick, ...props }) => (
  <div style={{ position: 'relative' }}>
    <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'rgba(183,110,121,0.4)' }}>
      {icon}
    </span>
    <input
      {...props}
      style={{
        width: '100%', paddingLeft: '44px', paddingRight: rightIcon ? '44px' : '16px',
        paddingTop: '14px', paddingBottom: '14px', borderRadius: '16px',
        color: '#fff', fontSize: '14px', outline: 'none',
        background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)',
        boxSizing: 'border-box',
      }}
      onFocus={(e) => {
        e.target.style.background = 'rgba(183,110,121,0.05)';
        e.target.style.border = '1px solid rgba(183,110,121,0.35)';
        e.target.style.boxShadow = '0 0 0 4px rgba(183,110,121,0.06)';
      }}
      onBlur={(e) => {
        e.target.style.background = 'rgba(255,255,255,0.03)';
        e.target.style.border = '1px solid rgba(255,255,255,0.07)';
        e.target.style.boxShadow = 'none';
      }}
    />
    {rightIcon && (
      <button type="button" onClick={onRightClick}
        style={{ position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#555', cursor: 'pointer' }}>
        {rightIcon}
      </button>
    )}
  </div>
);

const SubmitBtn = ({ loading, disabled, children }) => (
  <button type="submit" disabled={disabled || loading}
    style={{
      width: '100%', padding: '14px', borderRadius: '16px', fontWeight: 700, fontSize: '14px',
      color: '#fff', border: 'none', cursor: loading || disabled ? 'not-allowed' : 'pointer',
      opacity: loading || disabled ? 0.5 : 1,
      background: 'linear-gradient(135deg, #b76e79, #8c3343)',
      boxShadow: '0 4px 20px rgba(183,110,121,0.35)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px',
    }}>
    {loading ? <Loader2 size={17} style={{ animation: 'spin 1s linear infinite' }} /> : children}
  </button>
);

export default AuthModal;
