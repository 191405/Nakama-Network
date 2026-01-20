import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, CheckCircle, AlertCircle, Info, AlertTriangle } from 'lucide-react';

const NotificationItem = ({ 
  id, 
  message, 
  type = 'info', 
  duration = 4000, 
  onClose 
}) => {
  const [isExiting, setIsExiting] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsExiting(true);
    }, duration);

    return () => clearTimeout(timer);
  }, [duration]);

  const icons = {
    success: <CheckCircle className="text-green-400" size={20} />,
    error: <AlertCircle className="text-red-400" size={20} />,
    warning: <AlertTriangle className="text-yellow-400" size={20} />,
    info: <Info className="text-blue-400" size={20} />,
  };

  const colors = {
    success: 'from-green-600 to-emerald-600 border-green-500',
    error: 'from-red-600 to-pink-600 border-red-500',
    warning: 'from-yellow-600 to-orange-600 border-yellow-500',
    info: 'from-blue-600 to-cyan-600 border-blue-500',
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: -20, x: 100 }}
      animate={{ opacity: 1, y: 0, x: 0 }}
      exit={{ opacity: 0, y: -20, x: 100 }}
      className={`bg-gradient-to-r ${colors[type]} border backdrop-blur-md rounded-lg p-4 shadow-lg min-w-80 max-w-sm flex items-start gap-3`}
    >
      {icons[type]}
      <div className="flex-1 text-white">
        <p className="text-sm font-medium">{message}</p>
      </div>
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={() => {
          setIsExiting(true);
        }}
        className="text-white opacity-70 hover:opacity-100"
      >
        <X size={16} />
      </motion.button>
      
      <motion.div
        initial={{ scaleX: 1 }}
        animate={{ scaleX: 0 }}
        transition={{ duration: duration / 1000, ease: 'linear' }}
        onAnimationComplete={() => isExiting && onClose(id)}
        className={`absolute bottom-0 left-0 right-0 h-1 bg-gradient-to-r ${colors[type].split(' ')[0]} ${colors[type].split(' ')[1]}`}
        style={{ transformOrigin: 'left' }}
      />
    </motion.div>
  );
};

export const NotificationContainer = ({ notifications, onClose }) => {
  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3">
      <AnimatePresence>
        {notifications.map((notif) => (
          <NotificationItem
            key={notif.id}
            {...notif}
            onClose={onClose}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

export const useNotification = () => {
  const [notifications, setNotifications] = useState([]);

  const addNotification = (message, type = 'info', duration = 4000) => {
    const id = Date.now();
    setNotifications((prev) => [...prev, { id, message, type, duration }]);
    return id;
  };

  const removeNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};

export default NotificationItem;
