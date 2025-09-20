import * as fs from 'fs';
import * as path from 'path';

export enum LogLevel {
    INFO = 'INFO',
    ERROR = 'ERROR',
    WARN = 'WARN'
}

export class Logger {
    private logDir: string;
    private logFile: string;

    constructor() {
        this.logDir = path.join(__dirname, '..', 'logs');
        if (!fs.existsSync(this.logDir)) {
            fs.mkdirSync(this.logDir);
        }

        const date = new Date().toISOString().split('T')[0];
        this.logFile = path.join(this.logDir, `${date}.log`);
    }

    private logToFile(level: LogLevel, message: string): void {
        const timestamp = new Date().toISOString();
        const logEntry = `[${timestamp}] ${level}: ${message}\n`;
        
        fs.appendFileSync(this.logFile, logEntry);

        if (process.env.NODE_ENV !== 'production') {
            process.stdout.write(logEntry);
        }
    }

    public info(message: string): void {
        this.logToFile(LogLevel.INFO, message);
    }

    public error(message: string): void {
        this.logToFile(LogLevel.ERROR, message);
    }

    public warn(message: string): void {
        this.logToFile(LogLevel.WARN, message);
    }
}

export const logger = new Logger();