import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { UserCircle, Chrome, Mail, Loader2 } from 'lucide-react';
import { signInAnon, signInWithGoogle } from '../utils/firebase';

const Login = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAnonymousLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInAnon();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
      await signInWithGoogle();
    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 grid-background opacity-20"></div>
      <div className="absolute inset-0 nebula-bg"></div>
      
      {/* Floating Particles */}
      {[...Array(20)].map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            x: Math.random() * window.innerWidth, 
            y: Math.random() * window.innerHeight 
          }}
          animate={{
            y: [0, -30, 0],
            opacity: [0.2, 0.5, 0.2]
          }}
          transition={{
            duration: 3 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2
          }}
          className="absolute w-1 h-1 bg-neon-blue rounded-full"
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
        />
      ))}

      {/* Login Card */}
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="relative z-10 w-full max-w-md mx-4"
      >
        <div className="glass-panel rounded-2xl p-8 shadow-2xl border border-neon-blue/30">
          {/* Logo */}
          <motion.div
            animate={{
              boxShadow: [
                '0 0 20px rgba(0, 212, 255, 0.5)',
                '0 0 40px rgba(180, 0, 255, 0.5)',
                '0 0 20px rgba(0, 212, 255, 0.5)',
              ]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="w-24 h-24 mx-auto mb-6 bg-gradient-to-br from-neon-blue via-neon-purple to-neon-pink rounded-2xl flex items-center justify-center"
          >
            <span className="text-5xl font-bold">NK</span>
          </motion.div>

          {/* Title */}
          <h1 className="text-4xl font-bold text-center mb-2 neon-text">
            NK Network
          </h1>
          <p className="text-center text-gray-400 mb-8 font-mono text-sm">
            The Hidden Layer of Anime
          </p>

          {/* Login Buttons */}
          <div className="space-y-4">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-red-500 to-orange-500 rounded-xl font-bold text-white flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-red-500/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cyber-button"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <Chrome size={20} />
                  <span>Continue with Google</span>
                </>
              )}
            </motion.button>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={handleAnonymousLogin}
              disabled={loading}
              className="w-full py-4 bg-gradient-to-r from-neon-blue to-neon-purple rounded-xl font-bold text-white flex items-center justify-center space-x-3 hover:shadow-lg hover:shadow-neon-blue/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed cyber-button"
            >
              {loading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                <>
                  <UserCircle size={20} />
                  <span>Enter as Guest</span>
                </>
              )}
            </motion.button>
          </div>

          {/* Error Message */}
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 p-3 bg-red-500/20 border border-red-500/50 rounded-lg text-red-400 text-sm text-center"
            >
              {error}
            </motion.div>
          )}

          {/* Info */}
          <div className="mt-8 pt-6 border-t border-neon-blue/20">
            <p className="text-center text-xs text-gray-500 font-mono leading-relaxed">
              By entering, you agree to unlock your hidden chakra potential and join the most advanced anime network in existence.
            </p>
          </div>

          {/* Stats Preview */}
          <div className="mt-6 grid grid-cols-3 gap-4 text-center">
            <div className="glass-panel p-3 rounded-lg border border-neon-blue/20">
              <div className="text-2xl font-bold text-neon-blue">10K+</div>
              <div className="text-xs text-gray-400">Ninjas</div>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-neon-purple/20">
              <div className="text-2xl font-bold text-neon-purple">5K+</div>
              <div className="text-xs text-gray-400">Animes</div>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-neon-pink/20">
              <div className="text-2xl font-bold text-neon-pink">24/7</div>
              <div className="text-xs text-gray-400">Streaming</div>
            </div>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute -top-10 -left-10 w-40 h-40 bg-neon-blue/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-neon-purple/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </motion.div>
    </div>
  );
};

export default Login;
