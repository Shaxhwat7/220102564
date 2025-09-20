export type Stack = "backend" | "frontend";
export type Level = "debug" | "info" | "warn" | "error" | "fatal";
export type Package = "auth" | "config" | "middleware" | "utils" | "cache" | "controller" | "cron_job" | "db";

export interface LogEntry {
    timestamp: string;
    stack: Stack;
    level: Level;
    package: Package;
    message: string;
}