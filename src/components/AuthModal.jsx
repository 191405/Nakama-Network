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

  // Apple-style segmented control logic for tabs
  const tabStyle = (active) => ({
    background: active ? 'linear-gradient(180deg, rgba(30,30,30,0.8) 0%, rgba(15,15,15,0.95) 100%)' : 'transparent',
    color: active ? '#fff' : '#64748b',
    boxShadow: active ? '0 4px 15px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.05)' : 'none',
    border: active ? '1px solid rgba(255,255,255,0.06)' : '1px solid transparent',
  });

  return (
    <AnimatePresence>
      {isAuthModalOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          onClick={closeAuthModal}
          style={{
            position: 'fixed', inset: 0, zIndex: 99999, display: 'flex',
            alignItems: 'center', justifyContent: 'center', padding: '1rem',
            background: 'rgba(2,2,2,0.7)', backdropFilter: 'blur(16px)',
          }}
        >
          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300, mass: 0.8 }}
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative', width: '100%', maxWidth: '400px',
              borderRadius: '28px', padding: '2.5rem 2rem',
              background: 'linear-gradient(180deg, rgba(20,20,22,0.95) 0%, rgba(10,10,12,0.98) 100%)',
              border: '1px solid rgba(255,255,255,0.05)',
              boxShadow: '0 40px 100px -10px rgba(0,0,0,1), 0 0 0 1px rgba(183,110,121,0.05)',
              overflow: 'hidden'
            }}
          >
            {/* Absolute Ambient Rose Gold Glow behind content */}
            <div style={{
              position: 'absolute', top: '-15%', left: '50%', transform: 'translateX(-50%)',
              width: '80%', height: '40%', background: 'radial-gradient(ellipse at top, rgba(183,110,121,0.15), transparent 70%)',
              pointerEvents: 'none', zIndex: 0
            }} />

            {/* Close Button */}
            <button onClick={closeAuthModal} style={{
              position: 'absolute', top: '1.25rem', right: '1.25rem',
              background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)',
              borderRadius: '50%', padding: '8px', cursor: 'pointer',
              color: '#888', zIndex: 50, transition: 'all 0.2s ease',
            }}
              onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#fff'; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#888'; }}
            >
              <X size={14} />
            </button>

            {/* Content Container (elevated above ambient glow) */}
            <div style={{ position: 'relative', zIndex: 10 }}>
              
              {/* Header */}
              <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
                <div style={{
                  display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                  width: '56px', height: '56px', borderRadius: '18px', marginBottom: '1.25rem',
                  background: 'linear-gradient(135deg, rgba(183,110,121,0.15), rgba(183,110,121,0.05))',
                  border: '1px solid rgba(183,110,121,0.25)',
                  boxShadow: '0 8px 32px rgba(183,110,121,0.1)'
                }}>
                  <Sparkles size={24} style={{ color: '#e5b6bc' }} />
                </div>
                {authModalMessage && (
                  <motion.p initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                    style={{ color: '#b76e79', fontSize: '13px', fontWeight: 600, marginBottom: '12px', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
                    {authModalMessage}
                  </motion.p>
                )}
                <h2 style={{ 
                  fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-display)', 
                  letterSpacing: '-0.02em', margin: 0,
                  background: 'linear-gradient(180deg, #FFFFFF 0%, #A0A0A0 100%)',
                  WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
                }}>
                  Join the Network
                </h2>
              </div>

              {/* Segmented Controller Tab Bar */}
              {(mode === 'login' || mode === 'signup') && (
                <div style={{
                  display: 'flex', padding: '4px', borderRadius: '16px', marginBottom: '1.5rem',
                  background: 'rgba(0,0,0,0.4)', border: '1px solid rgba(255,255,255,0.04)',
                  boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)'
                }}>
                  <button type="button" onClick={() => { setMode('login'); setError(''); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', ...tabStyle(mode === 'login') }}>
                    Sign In
                  </button>
                  <button type="button" onClick={() => { setMode('signup'); setError(''); }}
                    style={{ flex: 1, padding: '10px', borderRadius: '12px', fontSize: '13px', fontWeight: 600, cursor: 'pointer', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', ...tabStyle(mode === 'signup') }}>
                    Create Account
                  </button>
                </div>
              )}

              {/* Form Container with Layout Animations */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={mode}
                  initial={{ opacity: 0, x: 10 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -10 }}
                  transition={{ duration: 0.25, ease: "easeOut" }}
                >
                  {/* Login Form */}
                  {mode === 'login' && (
                    <form onSubmit={handleLogin} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <div>
                        <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                          rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
                        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '8px', paddingRight: '4px' }}>
                          <button type="button" onClick={() => { setMode('forgot'); setError(''); setResetSent(false); }}
                            style={{ background: 'none', border: 'none', color: '#888', fontSize: '12px', cursor: 'pointer', fontWeight: 500, transition: 'color 0.2s' }}
                            onMouseEnter={e => e.currentTarget.style.color = '#b76e79'}
                            onMouseLeave={e => e.currentTarget.style.color = '#888'}
                          >
                            Forgot Password?
                          </button>
                        </div>
                      </div>
                      <SubmitBtn loading={loading} style={{ marginTop: '4px' }}>Sign In</SubmitBtn>
                    </form>
                  )}

                  {/* Signup Form */}
                  {mode === 'signup' && (
                    <form onSubmit={handleSignup} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                      <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)}
                        rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
                      <InputField icon={<Lock size={16} />} type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
                      <SubmitBtn loading={loading} style={{ marginTop: '4px' }}>Create Account <ArrowRight size={16} /></SubmitBtn>
                    </form>
                  )}

                  {/* Forgot Password */}
                  {mode === 'forgot' && (
                    <form onSubmit={handleForgot} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                      <p style={{ color: '#888', fontSize: '13px', textAlign: 'center', lineHeight: 1.6, padding: '0 10px', marginBottom: '4px' }}>
                        Enter your email and we'll send you a highly secure reset link.
                      </p>
                      {!resetSent ? (
                        <>
                          <InputField icon={<Mail size={16} />} type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                          <SubmitBtn loading={loading} disabled={!email} style={{ marginTop: '4px' }}>Send Reset Link</SubmitBtn>
                        </>
                      ) : (
                        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
                          style={{ padding: '20px', borderRadius: '16px', border: '1px solid rgba(34,197,94,0.15)', background: 'linear-gradient(135deg, rgba(34,197,94,0.05), rgba(34,197,94,0.02))', textAlign: 'center', boxShadow: '0 10px 30px rgba(34,197,94,0.05)' }}>
                          <CheckCircle size={28} style={{ color: '#4ade80', margin: '0 auto 12px', filter: 'drop-shadow(0 0 10px rgba(74,222,128,0.4))' }} />
                          <h4 style={{ color: '#fff', fontWeight: 700, fontSize: '15px', marginBottom: '4px' }}>Check Your Inbox</h4>
                          <p style={{ color: '#888', fontSize: '13px' }}>Reset link sent to <br/><strong style={{ color: '#fff', fontWeight: 600 }}>{email}</strong></p>
                        </motion.div>
                      )}
                      <button type="button" onClick={() => setMode('login')}
                        style={{ background: 'none', border: 'none', color: '#666', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '12px', fontWeight: 500, transition: 'all 0.2s', marginTop: '4px' }}
                        onMouseEnter={e => e.currentTarget.style.color = '#fff'}
                        onMouseLeave={e => e.currentTarget.style.color = '#666'}
                      >
                        <ArrowRight size={14} style={{ transform: 'rotate(180deg)' }} /> Back to Sign In
                      </button>
                    </form>
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Error */}
              <AnimatePresence>
                {error && (
                  <motion.div initial={{ opacity: 0, height: 0, marginTop: 0 }} animate={{ opacity: 1, height: 'auto', marginTop: 16 }} exit={{ opacity: 0, height: 0, marginTop: 0 }} style={{ overflow: 'hidden' }}>
                    <div style={{
                      padding: '12px 16px', borderRadius: '12px', fontSize: '13px', textAlign: 'center',
                      background: 'rgba(183,110,121,0.06)', border: '1px solid rgba(183,110,121,0.15)', color: '#e5b6bc',
                      fontWeight: 500
                    }}>
                      {error}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
              
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

/* ── Reusable sub-components ── */

const InputField = ({ icon, rightIcon, onRightClick, ...props }) => {
  const [isFocused, setIsFocused] = useState(false);
  
  return (
    <div style={{ position: 'relative' }}>
      <span style={{ 
        position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', 
        color: isFocused ? '#b76e79' : 'rgba(255,255,255,0.2)', transition: 'color 0.3s ease'
      }}>
        {icon}
      </span>
      <input
        {...props}
        style={{
          width: '100%', paddingLeft: '44px', paddingRight: rightIcon ? '44px' : '16px',
          paddingTop: '16px', paddingBottom: '16px', borderRadius: '16px',
          color: '#fff', fontSize: '14px', outline: 'none', fontWeight: 500,
          background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.06)',
          boxShadow: 'inset 0 2px 4px rgba(0,0,0,0.5)', boxSizing: 'border-box',
          transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        onFocus={(e) => {
          setIsFocused(true);
          e.target.style.background = 'rgba(183,110,121,0.03)';
          e.target.style.border = '1px solid rgba(183,110,121,0.4)';
          e.target.style.boxShadow = '0 0 0 4px rgba(183,110,121,0.05), inset 0 2px 4px rgba(0,0,0,0.2)';
        }}
        onBlur={(e) => {
          setIsFocused(false);
          e.target.style.background = 'rgba(0,0,0,0.3)';
          e.target.style.border = '1px solid rgba(255,255,255,0.06)';
          e.target.style.boxShadow = 'inset 0 2px 4px rgba(0,0,0,0.5)';
        }}
      />
      {rightIcon && (
        <button type="button" onClick={onRightClick}
          style={{ 
            position: 'absolute', right: '16px', top: '50%', transform: 'translateY(-50%)', 
            background: 'none', border: 'none', color: '#555', cursor: 'pointer', transition: 'color 0.2s'
          }}
          onMouseEnter={e => e.currentTarget.style.color = '#fff'}
          onMouseLeave={e => e.currentTarget.style.color = '#555'}
        >
          {rightIcon}
        </button>
      )}
    </div>
  );
};

const SubmitBtn = ({ loading, disabled, children, style = {} }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  return (
    <button type="submit" disabled={disabled || loading}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      style={{
        width: '100%', padding: '16px', borderRadius: '16px', fontWeight: 700, fontSize: '14px',
        color: '#fff', border: 'none', cursor: loading || disabled ? 'not-allowed' : 'pointer',
        opacity: loading || disabled ? 0.6 : 1,
        background: isHovered && !loading && !disabled 
          ? 'linear-gradient(135deg, #c27b87, #9e394b)' 
          : 'linear-gradient(135deg, #b76e79, #8c3343)',
        boxShadow: isHovered && !loading && !disabled 
          ? '0 8px 25px rgba(183,110,121,0.4)' 
          : '0 4px 15px rgba(183,110,121,0.25)',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        transform: isHovered && !loading && !disabled ? 'translateY(-1px)' : 'translateY(0)',
        ...style
      }}>
      {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : children}
    </button>
  );
};

export default AuthModal;

