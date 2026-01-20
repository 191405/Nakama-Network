import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UserCircle, Chrome, Loader2, AlertCircle, Mail, Lock, User, Eye, EyeOff, ArrowRight, CheckCircle, Wifi, WifiOff } from 'lucide-react';
import { signInWithGoogle, auth, signUpWithEmail, signInWithEmail, isUsernameAvailable, setUsername, createUserProfile, checkFirebaseConnection } from '../utils/firebase';
import { initLocalDevAuth } from '../utils/localDevAuth';

const Login = () => {
  const [mode, setMode] = useState('login'); 
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState('checking'); 

  useEffect(() => {
    const check = async () => {
      const isConnected = await checkFirebaseConnection();
      setConnectionStatus(isConnected ? 'connected' : 'disconnected');
    };
    check();
  }, []);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [username, setUsernameInput] = useState('');
  const [usernameAvailable, setUsernameAvailable] = useState(null);
  const [pendingUserId, setPendingUserId] = useState(null);

  const checkUsername = async (value) => {
    if (value.length < 3) {
      setUsernameAvailable(null);
      return;
    }
    const available = await isUsernameAvailable(value);
    setUsernameAvailable(available);
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (!auth) {
        
        initLocalDevAuth();
        setTimeout(() => window.location.reload(), 300);
        return;
      }

      await signInWithEmail(email, password);
      sessionStorage.removeItem('postLoginEntryAnimationSeen');
      
    } catch (err) {
      console.error('Login error:', err);
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email');
      } else if (err.code === 'auth/wrong-password') {
        setError('Incorrect password');
      } else {
        setError('Login failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleEmailSignup = async (e) => {
    e.preventDefault();
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      return;
    }

    try {
      setLoading(true);
      setError('');

      if (!auth) {
        initLocalDevAuth();
        setTimeout(() => window.location.reload(), 300);
        return;
      }

      const result = await signUpWithEmail(email, password);
      setPendingUserId(result.user.uid);

      await createUserProfile(result.user.uid, {
        email: result.user.email,
        createdAt: new Date(),
        isNewUser: true
      });

      setMode('username');
      setLoading(false);
    } catch (err) {
      console.error('Signup error:', err);
      if (err.code === 'auth/email-already-in-use') {
        setError('Email already in use. Try logging in instead.');
      } else {
        setError('Signup failed. Please try again.');
      }
      setLoading(false);
    }
  };

  const handleUsernameSubmit = async (e) => {
    e.preventDefault();
    if (!username || username.length < 3) {
      setError('Username must be at least 3 characters');
      return;
    }
    if (!usernameAvailable) {
      setError('Username is not available');
      return;
    }

    try {
      setLoading(true);
      await setUsername(pendingUserId, username);
      sessionStorage.removeItem('postLoginEntryAnimationSeen');
      
    } catch (err) {
      setError('Failed to set username');
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      if (!auth) {
        initLocalDevAuth();
        setTimeout(() => window.location.reload(), 300);
        return;
      }

      await signInWithGoogle();
      
      sessionStorage.removeItem('postLoginEntryAnimationSeen');
      
    } catch (err) {
      console.error('Google login error:', err);

      let msg = 'Google Login failed';
      if (err.code === 'auth/popup-closed-by-user') msg = 'Login cancelled';
      if (err.code === 'auth/popup-blocked') msg = 'Popup blocked by browser';
      if (err.code === 'auth/unauthorized-domain') msg = 'Domain not authorized in Firebase Console';
      if (err.code === 'auth/operation-not-allowed') msg = 'Google Sign-in not enabled in Firebase';
      setError(msg + ' (' + err.code + ')');
      setLoading(false);
    }
  };

  const handleGuestLogin = async () => {
    try {
      setLoading(true);
      setError('');
      
      localStorage.setItem('nakama_guest_mode', 'true');
      setTimeout(() => window.location.reload(), 300);
    } catch (err) {
      setError('Login failed');
      setLoading(false);
    }
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{ background: 'linear-gradient(135deg, #050505, #0a0a0a, #0f0f0a)' }}
    >
      {}
      <div className="absolute inset-0 grid-background opacity-10"></div>
      <motion.div
        className="absolute top-0 left-1/4 w-96 h-96 rounded-full blur-3xl"
        style={{ background: 'radial-gradient(circle, rgba(234,179,8,0.15), transparent)' }}
        animate={{ y: [0, 50, 0], scale: [1, 1.1, 1] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      />

      {}
      <div className="absolute top-4 right-4 z-50">
        <div className={`flex items-center gap-2 px-3 py-1.5 rounded-full border backdrop-blur-md transition-colors duration-500 ${connectionStatus === 'connected'
          ? 'bg-green-500/10 border-green-500/30 text-green-400'
          : connectionStatus === 'disconnected'
            ? 'bg-red-500/10 border-red-500/30 text-red-400'
            : 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400'
          }`}>
          {connectionStatus === 'connected' && <Wifi size={14} />}
          {connectionStatus === 'disconnected' && <WifiOff size={14} />}
          {connectionStatus === 'checking' && <Loader2 size={14} className="animate-spin" />}

          <span className="text-xs font-bold uppercase tracking-wider">
            {connectionStatus === 'connected' ? 'Systems Online' : connectionStatus === 'disconnected' ? 'Offline' : 'Syncing...'}
          </span>
        </div>
      </div>

      {}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div
          className="rounded-2xl p-8 relative overflow-hidden"
          style={{
            background: 'rgba(5, 5, 5, 0.95)',
            border: '1px solid rgba(202, 138, 4, 0.2)',
            boxShadow: '0 20px 60px rgba(0,0,0,0.8)'
          }}
        >
          {}
          <motion.div
            className="w-16 h-16 mx-auto mb-6 rounded-2xl flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #0a0a0a, #1a1a1a)', border: '2px solid rgba(202, 138, 4, 0.4)' }}
            animate={{ boxShadow: ['0 0 20px rgba(234, 179, 8, 0.2)', '0 0 40px rgba(234, 179, 8, 0.4)', '0 0 20px rgba(234, 179, 8, 0.2)'] }}
            transition={{ duration: 3, repeat: Infinity }}
          >
            <span className="text-3xl">🌙</span>
          </motion.div>

          {}
          <h1 className="text-center mb-2">
            <span className="text-3xl font-bold text-yellow-500">Nakama</span>
            <span className="text-3xl font-bold text-slate-100"> Network</span>
          </h1>
          <p className="text-center text-slate-500 text-sm mb-6">The Ultimate Anime Hub</p>

          <AnimatePresence mode="wait">
            {}
            {mode === 'username' && (
              <motion.form
                key="username"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleUsernameSubmit}
                className="space-y-4"
              >
                <div className="text-center mb-4">
                  <h2 className="text-xl font-bold text-white">Choose Your Username</h2>
                  <p className="text-slate-500 text-sm">This will be your identity across Nakama Network</p>
                </div>

                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => {
                      setUsernameInput(e.target.value);
                      checkUsername(e.target.value);
                    }}
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none"
                  />
                  {usernameAvailable !== null && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                      {usernameAvailable ? (
                        <CheckCircle className="text-green-500" size={18} />
                      ) : (
                        <AlertCircle className="text-red-500" size={18} />
                      )}
                    </div>
                  )}
                </div>

                <button
                  type="submit"
                  disabled={loading || !usernameAvailable}
                  className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-500 to-amber-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : <>Continue <ArrowRight size={18} /></>}
                </button>
              </motion.form>
            )}

            {}
            {mode === 'login' && (
              <motion.form
                key="login"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                onSubmit={handleEmailLogin}
                className="space-y-4"
              >
                {}
                <div className="flex bg-slate-900/50 rounded-xl p-1 mb-4">
                  <button type="button" onClick={() => setMode('login')} className="flex-1 py-2 rounded-lg font-semibold text-sm bg-yellow-500 text-black">Login</button>
                  <button type="button" onClick={() => setMode('signup')} className="flex-1 py-2 rounded-lg font-semibold text-sm text-slate-400 hover:text-white">Sign Up</button>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none"
                  />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none"
                  />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500">
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-500 to-amber-500 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Login'}
                </button>

                <div className="relative my-4">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-800"></div></div>
                  <div className="relative flex justify-center"><span className="px-2 bg-[#050505] text-slate-600 text-xs">OR</span></div>
                </div>

                <button type="button" onClick={handleGoogleLogin} disabled={loading} className="w-full py-3 rounded-xl font-bold text-white bg-red-600 hover:bg-red-500 flex items-center justify-center gap-2">
                  <Chrome size={18} /> Continue with Google
                </button>

                <button type="button" onClick={handleGuestLogin} disabled={loading} className="w-full py-3 rounded-xl font-bold text-slate-300 bg-slate-800 hover:bg-slate-700 flex items-center justify-center gap-2">
                  <UserCircle size={18} /> Enter as Guest
                </button>
              </motion.form>
            )}

            {}
            {mode === 'signup' && (
              <motion.form
                key="signup"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                onSubmit={handleEmailSignup}
                className="space-y-4"
              >
                {}
                <div className="flex bg-slate-900/50 rounded-xl p-1 mb-4">
                  <button type="button" onClick={() => setMode('login')} className="flex-1 py-2 rounded-lg font-semibold text-sm text-slate-400 hover:text-white">Login</button>
                  <button type="button" onClick={() => setMode('signup')} className="flex-1 py-2 rounded-lg font-semibold text-sm bg-yellow-500 text-black">Sign Up</button>
                </div>

                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full pl-10 pr-10 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none" />
                </div>

                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                  <input type={showPassword ? 'text' : 'password'} placeholder="Confirm Password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full pl-10 pr-4 py-3 bg-slate-900 border border-slate-700 rounded-xl text-white focus:border-yellow-500 outline-none" />
                </div>

                <button type="submit" disabled={loading} className="w-full py-3 rounded-xl font-bold text-black bg-gradient-to-r from-yellow-500 to-amber-500 disabled:opacity-50 flex items-center justify-center gap-2">
                  {loading ? <Loader2 className="animate-spin" size={18} /> : 'Create Account'}
                </button>
              </motion.form>
            )}
          </AnimatePresence>

          {}
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 p-3 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm text-center">
              {error}
            </motion.div>
          )}

          {}
          <div className="mt-6 pt-4 border-t border-slate-800">
            <p className="text-center text-xs text-slate-600">By entering, you agree to unlock your hidden potential</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;
