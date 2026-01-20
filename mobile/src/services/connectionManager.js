

import { AppState, NetInfo } from 'react-native';
import { API_BASE_URL } from './api';

const CONFIG = {
    
    HEALTH_CHECK_INTERVAL: 30000,       
    HEALTH_CHECK_TIMEOUT: 5000,         

    WS_RECONNECT_BASE_DELAY: 1000,      
    WS_RECONNECT_MAX_DELAY: 30000,      
    WS_RECONNECT_MAX_ATTEMPTS: 20,      
    WS_HEARTBEAT_INTERVAL: 25000,       
    WS_HEARTBEAT_TIMEOUT: 10000,        

    MAX_QUEUED_MESSAGES: 50,            
    QUEUE_FLUSH_BATCH_SIZE: 10,         
};

class ConnectionState {
    constructor() {
        this.isOnline = true;
        this.apiHealthy = true;
        this.wsConnections = new Map();  
        this.listeners = new Set();
        this.offlineQueue = [];
        this.lastHealthCheck = null;

        this._startHealthMonitor();
        this._setupAppStateListener();
    }

    subscribe(callback) {
        this.listeners.add(callback);
        
        callback(this.getState());
        return () => this.listeners.delete(callback);
    }

    notify() {
        const state = this.getState();
        this.listeners.forEach(cb => {
            try { cb(state); } catch (e) { console.error('Listener error:', e); }
        });
    }

    getState() {
        return {
            isOnline: this.isOnline,
            apiHealthy: this.apiHealthy,
            activeWebSockets: this.wsConnections.size,
            queuedMessages: this.offlineQueue.length,
            lastHealthCheck: this.lastHealthCheck,
        };
    }

    _startHealthMonitor() {
        this._checkHealth();
        this._healthInterval = setInterval(() => {
            this._checkHealth();
        }, CONFIG.HEALTH_CHECK_INTERVAL);
    }

    async _checkHealth() {
        try {
            const controller = new AbortController();
            const timeout = setTimeout(() => controller.abort(), CONFIG.HEALTH_CHECK_TIMEOUT);

            const response = await fetch(`${API_BASE_URL}/health`, {
                signal: controller.signal,
                headers: { 'bypass-tunnel-reminder': 'true' }
            });

            clearTimeout(timeout);

            const wasHealthy = this.apiHealthy;
            this.apiHealthy = response.ok;
            this.isOnline = true;
            this.lastHealthCheck = new Date().toISOString();

            if (!wasHealthy && this.apiHealthy) {
                console.log('✅ API connection restored');
                this._flushOfflineQueue();
            }

            this.notify();
        } catch (error) {
            console.log('❌ Health check failed:', error.message);
            this.apiHealthy = false;
            this.notify();
        }
    }

    _setupAppStateListener() {
        this._appStateSubscription = AppState.addEventListener('change', (nextState) => {
            if (nextState === 'active') {
                console.log('📱 App became active - checking connections');
                this._checkHealth();
                this._reconnectAllWebSockets();
            } else if (nextState === 'background') {
                console.log('📱 App going to background');
                
            }
        });
    }

    createWebSocket(roomId, userName, callbacks = {}) {
        
        if (this.wsConnections.has(roomId)) {
            this.closeWebSocket(roomId);
        }

        const wsManager = new WebSocketManager(roomId, userName, {
            onOpen: () => {
                this.wsConnections.set(roomId, wsManager);
                this.notify();
                callbacks.onOpen?.();
            },
            onClose: () => {
                this.wsConnections.delete(roomId);
                this.notify();
                callbacks.onClose?.();
            },
            onMessage: callbacks.onMessage,
            onError: callbacks.onError,
            onReconnecting: callbacks.onReconnecting,
        });

        wsManager.connect();
        return wsManager;
    }

    closeWebSocket(roomId) {
        const ws = this.wsConnections.get(roomId);
        if (ws) {
            ws.disconnect();
            this.wsConnections.delete(roomId);
            this.notify();
        }
    }

    _reconnectAllWebSockets() {
        this.wsConnections.forEach((ws, roomId) => {
            if (!ws.isConnected()) {
                ws.reconnect();
            }
        });
    }

    queueMessage(roomId, message) {
        if (this.offlineQueue.length >= CONFIG.MAX_QUEUED_MESSAGES) {
            this.offlineQueue.shift(); 
        }
        this.offlineQueue.push({ roomId, message, timestamp: Date.now() });
    }

    async _flushOfflineQueue() {
        if (this.offlineQueue.length === 0) return;

        console.log(`📤 Flushing ${this.offlineQueue.length} queued messages`);

        while (this.offlineQueue.length > 0) {
            const batch = this.offlineQueue.splice(0, CONFIG.QUEUE_FLUSH_BATCH_SIZE);

            for (const item of batch) {
                const ws = this.wsConnections.get(item.roomId);
                if (ws && ws.isConnected()) {
                    try {
                        ws.send(item.message);
                    } catch (e) {
                        console.error('Failed to send queued message:', e);
                    }
                }
            }

            await new Promise(r => setTimeout(r, 100));
        }
    }

    destroy() {
        if (this._healthInterval) {
            clearInterval(this._healthInterval);
        }
        if (this._appStateSubscription) {
            this._appStateSubscription.remove();
        }
        this.wsConnections.forEach(ws => ws.disconnect());
        this.wsConnections.clear();
        this.listeners.clear();
    }
}

class WebSocketManager {
    constructor(roomId, userName, callbacks = {}) {
        this.roomId = roomId;
        this.userName = userName;
        this.callbacks = callbacks;

        this.ws = null;
        this.isConnecting = false;
        this.reconnectAttempts = 0;
        this.reconnectTimeout = null;
        this.heartbeatInterval = null;
        this.heartbeatTimeout = null;
        this.shouldReconnect = true;
    }

    getWsUrl() {
        const httpUrl = API_BASE_URL || 'http://localhost:8001';
        const wsUrl = httpUrl.replace('http://', 'ws://').replace('https://', 'wss://');
        return `${wsUrl}/ws/${this.roomId}/${encodeURIComponent(this.userName)}`;
    }

    connect() {
        if (this.ws || this.isConnecting) return;

        this.isConnecting = true;
        this.shouldReconnect = true;

        const url = this.getWsUrl();
        console.log(`🔌 Connecting to: ${url}`);

        try {
            this.ws = new WebSocket(url);

            this.ws.onopen = () => {
                console.log(`✅ WebSocket connected to ${this.roomId}`);
                this.isConnecting = false;
                this.reconnectAttempts = 0;
                this._startHeartbeat();
                this.callbacks.onOpen?.();
            };

            this.ws.onmessage = (event) => {
                try {
                    const data = JSON.parse(event.data);

                    if (data.type === 'pong') {
                        this._handlePong();
                        return;
                    }

                    this.callbacks.onMessage?.(data);
                } catch (e) {
                    console.error('Failed to parse WebSocket message:', e);
                }
            };

            this.ws.onerror = (error) => {
                console.error(`WebSocket error in ${this.roomId}:`, error.message);
                this.callbacks.onError?.(error);
            };

            this.ws.onclose = (event) => {
                console.log(`🔌 WebSocket closed: ${this.roomId} (code: ${event.code})`);
                this._cleanup();
                this.callbacks.onClose?.(event);

                if (this.shouldReconnect && event.code !== 1000) {
                    this._scheduleReconnect();
                }
            };

        } catch (error) {
            console.error('WebSocket creation failed:', error);
            this.isConnecting = false;
            this._scheduleReconnect();
        }
    }

    disconnect() {
        this.shouldReconnect = false;
        this._cleanup();

        if (this.ws) {
            try {
                this.ws.close(1000, 'User disconnected');
            } catch (e) { }
            this.ws = null;
        }
    }

    reconnect() {
        this.disconnect();
        this.shouldReconnect = true;
        this.reconnectAttempts = 0;
        this.connect();
    }

    send(message) {
        if (!this.isConnected()) {
            console.warn('Cannot send - WebSocket not connected');
            connectionState.queueMessage(this.roomId, message);
            return false;
        }

        try {
            this.ws.send(JSON.stringify(message));
            return true;
        } catch (e) {
            console.error('Send failed:', e);
            connectionState.queueMessage(this.roomId, message);
            return false;
        }
    }

    isConnected() {
        return this.ws && this.ws.readyState === WebSocket.OPEN;
    }

    _startHeartbeat() {
        this._stopHeartbeat();

        this.heartbeatInterval = setInterval(() => {
            if (this.isConnected()) {
                this._sendPing();
            }
        }, CONFIG.WS_HEARTBEAT_INTERVAL);
    }

    _stopHeartbeat() {
        if (this.heartbeatInterval) {
            clearInterval(this.heartbeatInterval);
            this.heartbeatInterval = null;
        }
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    _sendPing() {
        try {
            this.ws.send(JSON.stringify({ type: 'ping' }));

            this.heartbeatTimeout = setTimeout(() => {
                console.log('💔 Heartbeat timeout - reconnecting');
                this.reconnect();
            }, CONFIG.WS_HEARTBEAT_TIMEOUT);
        } catch (e) {
            console.error('Ping failed:', e);
        }
    }

    _handlePong() {
        if (this.heartbeatTimeout) {
            clearTimeout(this.heartbeatTimeout);
            this.heartbeatTimeout = null;
        }
    }

    _scheduleReconnect() {
        if (!this.shouldReconnect) return;
        if (this.reconnectAttempts >= CONFIG.WS_RECONNECT_MAX_ATTEMPTS) {
            console.log('❌ Max reconnect attempts reached');
            this.callbacks.onError?.({ message: 'Max reconnect attempts reached' });
            return;
        }

        const delay = Math.min(
            CONFIG.WS_RECONNECT_BASE_DELAY * Math.pow(2, this.reconnectAttempts) + Math.random() * 1000,
            CONFIG.WS_RECONNECT_MAX_DELAY
        );

        this.reconnectAttempts++;
        console.log(`🔄 Reconnecting in ${Math.round(delay)}ms (attempt ${this.reconnectAttempts})`);

        this.callbacks.onReconnecting?.(this.reconnectAttempts, delay);

        this.reconnectTimeout = setTimeout(() => {
            this.connect();
        }, delay);
    }

    _cleanup() {
        this.isConnecting = false;
        this._stopHeartbeat();

        if (this.reconnectTimeout) {
            clearTimeout(this.reconnectTimeout);
            this.reconnectTimeout = null;
        }
    }
}

export const connectionState = new ConnectionState();

export function useConnectionState() {
    const [state, setState] = React.useState(connectionState.getState());

    React.useEffect(() => {
        return connectionState.subscribe(setState);
    }, []);

    return state;
}

export { WebSocketManager, CONFIG as CONNECTION_CONFIG };
