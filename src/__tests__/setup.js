import '@testing-library/jest-dom';

// Mock Firebase — prevent real connections during tests
vi.mock('../utils/firebase', () => ({
  auth: null,
  db: null,
  storage: null,
  createUserProfile: vi.fn(),
  getUserProfile: vi.fn(),
  updateUserProfile: vi.fn(),
  subscribeToUserProfile: vi.fn(),
}));

// Mock Firebase Auth module
vi.mock('firebase/auth', () => ({
  onAuthStateChanged: vi.fn(),
  signInWithEmailAndPassword: vi.fn(),
  createUserWithEmailAndPassword: vi.fn(),
  signOut: vi.fn(),
  sendPasswordResetEmail: vi.fn(),
}));

// Mock framer-motion to avoid animation issues in tests
vi.mock('framer-motion', () => ({
  motion: new Proxy({}, {
    get: (_, tag) => {
      return ({ children, ...props }) => {
        const React = require('react');
        // Filter out framer-motion-specific props
        const validProps = {};
        const invalidProps = ['initial', 'animate', 'exit', 'variants', 'transition', 'whileHover', 'whileTap', 'whileInView', 'layout', 'layoutId'];
        Object.keys(props).forEach(key => {
          if (!invalidProps.includes(key)) validProps[key] = props[key];
        });
        return React.createElement(tag, validProps, children);
      };
    },
  }),
  AnimatePresence: ({ children }) => children,
  useMotionValue: () => ({ set: vi.fn(), get: () => 0 }),
  useTransform: () => ({ set: vi.fn(), get: () => 0 }),
  useSpring: () => ({ set: vi.fn(), get: () => 0 }),
  useAnimation: () => ({ start: vi.fn(), stop: vi.fn() }),
}));
