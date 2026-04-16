import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Loader2, AlertCircle, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, Sparkles, X } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';

const LuxuryInput = ({ icon: Icon, rightIcon, onRightClick, ...props }) => (
  <div className="relative group">
    <Icon className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors duration-300" size={16}
      style={{ color: 'rgba(244,114,182,0.4)' }}
    />
    <input
      {...props}
      className="w-full pl-11 pr-11 py-3.5 rounded-2xl text-white placeholder-slate-600 text-sm transition-all duration-300 focus:outline-none"
      style={{
        background: 'rgba(255,255,255,0.03)',
        border: '1px solid rgba(255,255,255,0.07)',
      }}
      onFocus={(e) => {
        e.target.style.background = 'rgba(244,63,94,0.05)';
        e.target.style.border = '1px solid rgba(244,63,94,0.35)';
        e.target.style.boxShadow = '0 0 0 4px rgba(244,63,94,0.06)';
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        e.target.style.background = 'rgba(255,255,255,0.03)';
        e.target.style.border = '1px solid rgba(255,255,255,0.07)';
        e.target.style.boxShadow = 'none';
        props.onBlur?.(e);
      }}
    />
    {rightIcon && (
      <button type="button" onClick={onRightClick} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
        {rightIcon}
      </button>
    )}
  </div>
);

const AuthModal = () => {
  const { isAuthModalOpen, closeAuthModal, authModalMessage } = useAuth();
  const [mode, setMode] = useState('login');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsernameInput] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [pendingUserId, setPendingUserId] = useState(null);

  useEffect(() => {
    if (isAuthModalOpen) {
      setMode('login');
      setError('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
    }
  }, [isAuthModalOpen]);

  if (!isAuthModalOpen) return null;

  const checkUsername = async (value) => {
    // Backend username availability check could be implemented here
    setUsernameAvailable(true); 
  };

  const { login, register, forgotPassword, closeAuthModal: closeAuth, authModalMessage: authMessage } = useAuth();
  
  const handleEmailLogin = async (e) => {
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

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) { setError('Please fill in all fields'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    
    // For simplicity in the "username" step, we'll use a placeholder or derived one first
    const defaultDisplayName = email.split('@')[0];
    
    try {
      setLoading(true); setError('');
      await register(email, password, defaultDisplayName);
      setLoading(false);
      closeAuthModal();
    } catch (err) {
      setError(err.message || 'Signup failed. Please try again.');
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username || username.length < 3) { setError('Username must be at least 3 characters'); return; }
    if (!usernameAvailable) { setError('Username is not available'); return; }
    try {
      setLoading(true);
      await setUsername(pendingUserId, username);
      setLoading(false);
      closeAuthModal();
    } catch { setError('Failed to set username'); setLoading(false); }
  };

  const [resetSent, setResetSent] = useState(false);
  
  const handleForgotPassword = async (e) => {
    e.preventDefault();
    if (!email) { setError('Please enter your email address'); return; }
    try {
      setLoading(true); setError('');
      await forgotPassword(email);
      setResetSent(true);
      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to send reset email. Please try again.');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true); setError('');
      if (!auth) { initLocalDevAuth(); setTimeout(() => window.location.reload(), 300); return; }
      await signInWithGoogle();
      setLoading(false);
      closeAuthModal();
    } catch (err) {
      setError('Google Login failed: ' + err.message);
      setLoading(false);
    }
  };

  const tabBtn = (label, targetMode) => (
    <button type="button" onClick={() => { setMode(targetMode); setError(''); }}
      className="flex-1 py-2.5 rounded-xl text-sm font-semibold transition-all duration-300"
      style={{
        background: mode === targetMode ? 'linear-gradient(135deg, #f43f5e, #e11d48)' : 'transparent',
        color: mode === targetMode ? '#fff' : '#64748b',
        boxShadow: mode === targetMode ? '0 4px 15px rgba(244,63,94,0.35)' : 'none',
      }}
    >{label}</button>
  );

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
        className="fixed inset-0 z-[10000] flex items-center justify-center p-4"
        style={{ background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(12px)' }}
      >
        <motion.div 
          initial={{ scale: 0.95, opacity: 0, y: 10 }} 
          animate={{ scale: 1, opacity: 1, y: 0 }} 
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative w-full max-w-sm rounded-[24px] p-8 overflow-hidden"
          style={{ 
            background: 'rgba(10, 10, 10, 0.95)', 
            border: '1px solid rgba(255,255,255,0.08)', 
            boxShadow: '0 30px 80px rgba(0,0,0,0.9), 0 0 0 1px rgba(255,255,255,0.02) inset' 
          }}
        >
          {/* Close button */}
          <button onClick={closeAuthModal} className="absolute top-4 right-4 text-slate-500 hover:text-white transition-colors bg-white/5 hover:bg-white/10 p-2 rounded-full cursor-pointer z-50">
            <X size={16} />
          </button>

          {/* Top shimmer */}
          <div className="absolute top-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/50 to-transparent" />

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl mb-4"
              style={{ background: 'linear-gradient(135deg, rgba(244,63,94,0.1), rgba(139,92,246,0.05))', border: '1px solid rgba(244,63,94,0.2)' }}
            >
              <Sparkles size={20} className="text-rose-500" />
            </div>
            {authModalMessage && <p className="text-rose-400 text-sm font-medium mb-2">{authModalMessage}</p>}
            <h2 className="text-xl font-black text-white" style={{ fontFamily: 'var(--font-display)' }}>
              Join the Network
            </h2>
          </div>

          <AnimatePresence mode="wait">
            {/* Username Mode */}
            {mode === 'username' && (
              <motion.form key="username" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleUsernameSubmit} className="space-y-4">
                <div className="relative">
                  <LuxuryInput icon={User} type="text" placeholder="Username" value={username}
                    onChange={(e) => { setUsernameInput(e.target.value); checkUsername(e.target.value); }}
                  />
                  {usernameAvailable !== null && (
                    <div className="absolute right-4 top-1/2 -translate-y-1/2">
                      {usernameAvailable ? <CheckCircle className="text-emerald-400" size={16} /> : <AlertCircle className="text-red-400" size={16} />}
                    </div>
                  )}
                </div>
                <PrimaryBtn loading={loading} disabled={loading || !usernameAvailable}>
                  Continue <ArrowRight size={16} />
                </PrimaryBtn>
              </motion.form>
            )}

            {/* Login Mode */}
            {mode === 'login' && (
              <motion.form key="login" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} onSubmit={handleEmailLogin} className="space-y-3">
                <div className="flex p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {tabBtn('Sign In', 'login')}
                  {tabBtn('Create Account', 'signup')}
                </div>
                <LuxuryInput icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                <div>
                  <LuxuryInput icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                    rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
                  <div className="flex justify-end mt-1.5 px-2">
                    <button type="button" onClick={() => { setMode('forgot-password'); setError(''); setResetSent(false); }} className="text-xs text-rose-400 hover:text-rose-300 transition-colors">
                      Forgot Password?
                    </button>
                  </div>
                </div>
                <PrimaryBtn loading={loading} disabled={loading}>Sign In</PrimaryBtn>
                <Divider />
                <GoogleBtn onClick={handleGoogleLogin} loading={loading} />
              </motion.form>
            )}

            {/* Forgot Password Mode */}
            {mode === 'forgot-password' && (
              <motion.form key="forgot" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} onSubmit={handleForgotPassword} className="space-y-4">
                <div className="text-center mb-2">
                  <p className="text-[#888] text-sm leading-relaxed">
                    Enter your email address and we'll send you a link to reset your password.
                  </p>
                </div>

                {!resetSent ? (
                  <>
                    <LuxuryInput icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                    <PrimaryBtn loading={loading} disabled={loading || !email}>Send Reset Link</PrimaryBtn>
                  </>
                ) : (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.05] text-center space-y-2 mb-2">
                     <CheckCircle className="text-emerald-400 mx-auto" size={24} />
                     <h4 className="text-white font-bold text-sm">Check Your Inbox</h4>
                     <p className="text-[#888] text-xs">We've sent a password reset link to <strong className="text-emerald-400">{email}</strong>.</p>
                  </motion.div>
                )}
                
                <button type="button" onClick={() => setMode('login')} className="w-full py-2 text-sm text-[#888] hover:text-white transition-colors flex items-center justify-center gap-2">
                  <ArrowRight className="rotate-180" size={14} /> Back to Sign In
                </button>
              </motion.form>
            )}

            {/* Signup Mode */}
            {mode === 'signup' && (
              <motion.form key="signup" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} onSubmit={handleEmailSignup} className="space-y-3">
                <div className="flex p-1 rounded-2xl mb-4" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.05)' }}>
                  {tabBtn('Sign In', 'login')}
                  {tabBtn('Create Account', 'signup')}
                </div>
                <LuxuryInput icon={Mail} type="email" placeholder="Email address" value={email} onChange={e => setEmail(e.target.value)} />
                <LuxuryInput icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={e => setPassword(e.target.value)}
                  rightIcon={showPassword ? <EyeOff size={16} /> : <Eye size={16} />} onRightClick={() => setShowPassword(v => !v)} />
                <LuxuryInput icon={Lock} type={showPassword ? 'text' : 'password'} placeholder="Confirm password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} />
                <PrimaryBtn loading={loading} disabled={loading}>Create Account <ArrowRight size={16} /></PrimaryBtn>
              </motion.form>
            )}
          </AnimatePresence>

          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-4 p-3 rounded-2xl text-xs text-red-300 text-center"
              style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)' }}>
              {error}
            </motion.div>
          )}

          <div className="absolute bottom-0 left-1/4 right-1/4 h-[1px] bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

const PrimaryBtn = ({ loading, disabled, children }) => (
  <button type="submit" disabled={disabled}
    className="w-full py-3.5 rounded-2xl font-bold text-sm text-white flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
    style={{ background: 'linear-gradient(135deg, #f43f5e, #e11d48)', boxShadow: '0 4px 20px rgba(244,63,94,0.35)' }}
    onMouseEnter={e => !disabled && (e.currentTarget.style.boxShadow = '0 8px 30px rgba(244,63,94,0.55)', e.currentTarget.style.transform = 'translateY(-1px)')}
    onMouseLeave={e => (e.currentTarget.style.boxShadow = '0 4px 20px rgba(244,63,94,0.35)', e.currentTarget.style.transform = 'none')}
  >
    {loading ? <Loader2 className="animate-spin" size={17} /> : children}
  </button>
);

const GoogleBtn = ({ onClick, loading }) => (
  <button type="button" onClick={onClick} disabled={loading}
    className="w-full py-3.5 rounded-2xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-300 disabled:opacity-50"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.07)', color: '#94a3b8' }}
    onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.color = '#e2e8f0'; }}
    onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.color = '#94a3b8'; }}
  >
    <svg width="17" height="17" viewBox="0 0 24 24"><path fill="#EA4335" d="M5.26 9.77A7.2 7.2 0 0 1 12 4.8c1.74 0 3.3.63 4.52 1.64l3.36-3.36A12 12 0 0 0 0 12c0 1.98.48 3.84 1.33 5.48l3.93-3.05V9.77Z" /><path fill="#34A853" d="M12 24c3.08 0 5.86-1.05 8.06-2.8l-3.81-3.01a7.2 7.2 0 0 1-10.98-3.47L1.33 17.48A12 12 0 0 0 12 24Z" /><path fill="#4A90D9" d="M23.76 12.27c0-.77-.07-1.52-.2-2.27H12v4.52h6.6a5.71 5.71 0 0 1-2.44 3.68l3.81 3.01C21.8 19.26 23.76 16 23.76 12.27Z" /><path fill="#FBBC05" d="M5.26 14.23a7.2 7.2 0 0 1 0-4.46L1.33 6.72A12 12 0 0 0 0 12c0 1.85.43 3.6 1.2 5.16l4.06-2.93Z" /></svg>
    Continue with Google
  </button>
);

const Divider = () => (
  <div className="flex items-center gap-3 my-1">
    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.05)' }} />
    <span className="text-slate-700 text-xs">or</span>
    <div className="flex-1 h-[1px]" style={{ background: 'rgba(255,255,255,0.05)' }} />
  </div>
);

export default AuthModal;
