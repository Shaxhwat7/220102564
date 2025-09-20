import axios from 'axios';
import { Stack, Level, Package, LogEntry } from './LogEntry';

export class Logger {
    private static instance: Logger;
    private readonly API_URL = 'http://20.244.56.144/evaluation-service/logs';

    private constructor() {}

    public static getInstance(): Logger {
        if (!Logger.instance) {
            Logger.instance = new Logger();
        }
        return Logger.instance;
    }

    private validateInput(stack: Stack, level: Level, pkg: Package): boolean {
        const validStacks: Stack[] = ["backend", "frontend"];
        const validLevels: Level[] = ["debug", "info", "warn", "error", "fatal"];
        const validPackages: Package[] = ["auth", "config", "middleware", "utils", "cache", "controller", "cron_job", "db"];

        return (
            validStacks.includes(stack.toLowerCase() as Stack) &&
            validLevels.includes(level.toLowerCase() as Level) &&
            validPackages.includes(pkg.toLowerCase() as Package)
        );
    }

    async log(stack: Stack, level: Level, pkg: Package, message: string): Promise<void> {
        try {
            if (!this.validateInput(stack, level, pkg)) {
                throw new Error('Invalid input parameters');
            }

            const logEntry: LogEntry = {
                timestamp: new Date().toISOString(),
                stack: stack.toLowerCase() as Stack,
                level: level.toLowerCase() as Level,
                package: pkg.toLowerCase() as Package,
                message
            };

            const response = await axios.post(this.API_URL, logEntry);
            if (response.status !== 200) {
                throw new Error(`Logging API returned status ${response.status}`);
            }
        } catch (error) {
            console.error('Logging API Error:', error instanceof Error ? error.message : 'Unknown error');
            throw error;
        }
    }

    async debug(stack: Stack, pkg: Package, message: string): Promise<void> {
        try {
            await this.log(stack, 'debug', pkg, message);
        } catch (error) {
            console.error('Debug log failed:', error);
        }
    }

    async info(stack: Stack, pkg: Package, message: string): Promise<void> {
        try {
            await this.log(stack, 'info', pkg, message);
        } catch (error) {
            console.error('Info log failed:', error);
        }
    }

    async warn(stack: Stack, pkg: Package, message: string): Promise<void> {
        try {
            await this.log(stack, 'warn', pkg, message);
        } catch (error) {
            console.error('Warn log failed:', error);
        }
    }

    async error(stack: Stack, pkg: Package, message: string): Promise<void> {
        try {
            await this.log(stack, 'error', pkg, message);
        } catch (error) {
            console.error('Error log failed:', error);
        }
    }

    async fatal(stack: Stack, pkg: Package, message: string): Promise<void> {
        try {
            await this.log(stack, 'fatal', pkg, message);
        } catch (error) {
            console.error('Fatal log failed:', error);
        }
    }
}