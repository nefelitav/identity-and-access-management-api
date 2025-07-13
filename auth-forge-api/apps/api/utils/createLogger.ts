type LogLevel = 'info' | 'warn' | 'error' | 'debug';

interface Logger {
    info: (msg: string) => void;
    warn: (msg: string) => void;
    error: (msg: string, error?: Error) => void;
    debug: (msg: string) => void;
}

export function createLogger(context?: string): Logger {
    const formatMessage = (level: LogLevel, message: string) => {
        const timestamp = new Date().toISOString();
        return `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ''} ${message}`;
    };

    return {
        info: (msg: string) => console.info(formatMessage('info', msg)),
        warn: (msg: string) => console.warn(formatMessage('warn', msg)),
        error: (msg: string, error?: Error) => {
            console.error(formatMessage('error', msg));
            if (error) console.error(error.stack);
        },
        debug: (msg: string) => {
            if (process.env.NODE_ENV === 'development') {
                console.debug(formatMessage('debug', msg));
            }
        },
    };
}
