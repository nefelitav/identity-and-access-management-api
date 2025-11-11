type LogLevel = "info" | "warn" | "error" | "debug";

interface Logger {
  info: (msg: string, meta?: Record<string, unknown>) => void;
  warn: (msg: string, meta?: Record<string, unknown>) => void;
  error: (msg: string, error?: Error, meta?: Record<string, unknown>) => void;
  debug: (msg: string, meta?: Record<string, unknown>) => void;
}

export default function createLogger(context?: string): Logger {
  const formatMessage = (level: LogLevel, message: string) => {
    const timestamp = new Date().toISOString();
    return `[${timestamp}] [${level.toUpperCase()}]${context ? ` [${context}]` : ""} ${message}`;
  };

  const formatMeta = (meta?: Record<string, unknown>) => {
    return meta ? ` | metadata: ${JSON.stringify(meta)}` : "";
  };

  return {
    info: (msg: string, meta?: Record<string, unknown>) =>
      console.info(formatMessage("info", msg) + formatMeta(meta)),
    warn: (msg: string, meta?: Record<string, unknown>) =>
      console.warn(formatMessage("warn", msg) + formatMeta(meta)),
    error: (msg: string, error?: Error, meta?: Record<string, unknown>) => {
      console.error(formatMessage("error", msg) + formatMeta(meta));
      if (error) console.error(error.stack);
    },
    debug: (msg: string, meta?: Record<string, unknown>) => {
      if (process.env.NODE_ENV === "development") {
        console.debug(formatMessage("debug", msg) + formatMeta(meta));
      }
    },
  };
}
