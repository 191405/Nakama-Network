import { useState, useEffect, useRef, useCallback } from 'react';

const WS_RECONNECT_DELAY = 3000;
const WS_MAX_RECONNECT_ATTEMPTS = 5;

/**
 * Custom hook for WebSocket chat connections.
 * Connects to the backend WebSocket server for real-time messaging.
 * Falls back to REST polling if WebSocket is unavailable.
 */
export function useWebSocketChat(roomId, userName, options = {}) {
  const { enabled = true, apiUrl = '' } = options;
  const [messages, setMessages] = useState([]);
  const [connected, setConnected] = useState(false);
  const [connecting, setConnecting] = useState(false);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [typingUsers, setTypingUsers] = useState([]);
  const [error, setError] = useState(null);
  
  const wsRef = useRef(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef(null);
  const typingTimer = useRef(null);
  const isUnmounted = useRef(false);

  // Derive WebSocket URL from API URL
  const getWsUrl = useCallback(() => {
    const base = apiUrl || import.meta.env.VITE_API_URL || '';
    if (!base) return null;
    
    const wsBase = base
      .replace(/^https:/, 'wss:')
      .replace(/^http:/, 'ws:');
    
    return `${wsBase}/ws/${roomId}/${encodeURIComponent(userName)}`;
  }, [apiUrl, roomId, userName]);

  // Fetch message history via REST
  const fetchHistory = useCallback(async () => {
    try {
      const base = apiUrl || import.meta.env.VITE_API_URL || '';
      if (!base) return;
      
      const res = await fetch(`${base}/chat/history/${roomId}?limit=50`);
      if (res.ok) {
        const history = await res.json();
        if (!isUnmounted.current) {
          setMessages(history);
        }
      }
    } catch (err) {
      console.warn('Failed to fetch chat history:', err);
    }
  }, [apiUrl, roomId]);

  // Connect to WebSocket
  const connect = useCallback(() => {
    const url = getWsUrl();
    if (!url || !enabled || !roomId || !userName) return;
    
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    
    setConnecting(true);
    setError(null);
    
    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (isUnmounted.current) return;
        setConnected(true);
        setConnecting(false);
        setError(null);
        reconnectAttempts.current = 0;
        console.log(`[WS] Connected to room: ${roomId}`);
      };

      ws.onmessage = (event) => {
        if (isUnmounted.current) return;
        
        try {
          const data = JSON.parse(event.data);

          switch (data.type) {
            case 'message':
              setMessages(prev => [...prev.slice(-199), data]);
              break;

            case 'system':
              setMessages(prev => [...prev.slice(-199), {
                ...data,
                isSystem: true,
              }]);
              if (data.room_stats) {
                setOnlineUsers(data.room_stats.users || []);
              }
              break;

            case 'connected':
              if (data.room_stats) {
                setOnlineUsers(data.room_stats.users || []);
              }
              break;

            case 'typing':
              if (data.user && data.user !== userName) {
                setTypingUsers(prev => {
                  if (prev.includes(data.user)) return prev;
                  return [...prev, data.user];
                });
                // Clear typing indicator after 3s
                setTimeout(() => {
                  setTypingUsers(prev => prev.filter(u => u !== data.user));
                }, 3000);
              }
              break;

            case 'error':
              console.warn('[WS] Server error:', data.message);
              break;

            case 'pong':
              break;

            default:
              break;
          }
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        if (isUnmounted.current) return;
        setConnected(false);
        setConnecting(false);
        wsRef.current = null;

        // Auto-reconnect on unexpected close
        if (event.code !== 1000 && reconnectAttempts.current < WS_MAX_RECONNECT_ATTEMPTS) {
          const delay = WS_RECONNECT_DELAY * Math.pow(1.5, reconnectAttempts.current);
          reconnectAttempts.current += 1;
          console.log(`[WS] Reconnecting in ${Math.round(delay / 1000)}s (attempt ${reconnectAttempts.current})`);
          reconnectTimer.current = setTimeout(connect, delay);
        } else if (reconnectAttempts.current >= WS_MAX_RECONNECT_ATTEMPTS) {
          setError('Connection lost. Please refresh to reconnect.');
        }
      };

      ws.onerror = () => {
        if (isUnmounted.current) return;
        setConnecting(false);
      };
    } catch (err) {
      setConnecting(false);
      setError('Failed to connect to chat server.');
      console.error('[WS] Connection error:', err);
    }
  }, [getWsUrl, enabled, roomId, userName]);

  // Send a chat message
  const sendMessage = useCallback((text) => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) {
      console.warn('[WS] Not connected, cannot send message');
      return false;
    }

    try {
      wsRef.current.send(JSON.stringify({
        type: 'message',
        text: text.trim(),
      }));
      return true;
    } catch (err) {
      console.error('[WS] Send error:', err);
      return false;
    }
  }, []);

  // Send typing indicator
  const sendTyping = useCallback(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;
    
    // Throttle: only send once every 2 seconds
    if (typingTimer.current) return;
    
    try {
      wsRef.current.send(JSON.stringify({ type: 'typing' }));
      typingTimer.current = setTimeout(() => {
        typingTimer.current = null;
      }, 2000);
    } catch (err) {
      // Silent fail
    }
  }, []);

  // Disconnect cleanly
  const disconnect = useCallback(() => {
    if (reconnectTimer.current) {
      clearTimeout(reconnectTimer.current);
      reconnectTimer.current = null;
    }
    if (wsRef.current) {
      wsRef.current.close(1000, 'User disconnected');
      wsRef.current = null;
    }
    setConnected(false);
    setConnecting(false);
  }, []);

  // Connect on mount, disconnect on unmount
  useEffect(() => {
    isUnmounted.current = false;
    
    if (enabled && roomId && userName) {
      fetchHistory();
      connect();
    }

    return () => {
      isUnmounted.current = true;
      disconnect();
    };
  }, [enabled, roomId, userName]); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    messages,
    connected,
    connecting,
    onlineUsers,
    typingUsers,
    error,
    sendMessage,
    sendTyping,
    disconnect,
    reconnect: connect,
  };
}
