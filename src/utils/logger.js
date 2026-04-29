const LogLevels = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3,
};

const CURRENT_LOG_LEVEL = import.meta.env.DEV ? LogLevels.DEBUG : LogLevels.INFO;

class Logger {
    formatMessage(level, message, data) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level}]`;
        if (data !== undefined) {
            return `${prefix} ${message} | Data: ${JSON.stringify(data)}`;
        }
        return `${prefix} ${message}`;
    }

    debug(message, data) {
        if (CURRENT_LOG_LEVEL <= LogLevels.DEBUG) {
            console.debug(this.formatMessage('DEBUG', message, data));
        }
    }

    info(message, data) {
        if (CURRENT_LOG_LEVEL <= LogLevels.INFO) {
            console.info(this.formatMessage('INFO', message, data));
        }
    }

    warn(message, data) {
        if (CURRENT_LOG_LEVEL <= LogLevels.WARN) {
            console.warn(this.formatMessage('WARN', message, data));
        }
    }

    error(message, error) {
        if (CURRENT_LOG_LEVEL <= LogLevels.ERROR) {
            const errorStack = error instanceof Error ? error.stack : '';
            console.error(this.formatMessage('ERROR', message, error?.message || error), errorStack);
        }
    }
}

export const logger = new Logger();
