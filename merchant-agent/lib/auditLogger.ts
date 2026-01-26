/**
 * Simple client-side audit logger.
 * In production, this would send logs to a backend service like analytics or Splunk.
 */

interface LogEntry {
    timestamp: string;
    level: 'INFO' | 'WARN' | 'ERROR' | 'ACTION';
    category: string;
    message: string;
    details?: any;
    userId?: string; // Agent ID
}

class AuditLogger {
    private static instance: AuditLogger;
    private logs: LogEntry[] = [];

    private constructor() { }

    public static getInstance(): AuditLogger {
        if (!AuditLogger.instance) {
            AuditLogger.instance = new AuditLogger();
        }
        return AuditLogger.instance;
    }

    public log(level: LogEntry['level'], category: string, message: string, details?: any) {
        const entry: LogEntry = {
            timestamp: new Date().toISOString(),
            level,
            category,
            message,
            details,
        };

        // In dev, print to console
        if (process.env.NODE_ENV !== 'production') {
            const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
            console.log(`${color}[${level}] [${category}] ${message}\x1b[0m`, details || '');
        }

        this.logs.push(entry);

        // TODO: Batch send logs to backend
    }

    public info(category: string, message: string, details?: any) {
        this.log('INFO', category, message, details);
    }

    public warn(category: string, message: string, details?: any) {
        this.log('WARN', category, message, details);
    }

    public error(category: string, message: string, details?: any) {
        this.log('ERROR', category, message, details);
    }

    public action(category: string, message: string, details?: any) {
        this.log('ACTION', category, message, details);
    }

    public getLogs(): LogEntry[] {
        return this.logs;
    }
}

export default AuditLogger.getInstance();
