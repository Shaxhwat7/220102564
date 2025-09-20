import { Request, Response, NextFunction } from 'express';
import { Logger } from './middleware.js';

export const loggingMiddleware = async (req: Request, res: Response, next: NextFunction) => {
    const logger = Logger.getInstance();
    const startTime = Date.now();

    try {
        await logger.info('backend', 'middleware', 
            `Incoming ${req.method} request to ${req.path}`);

        const originalSend = res.send;
        res.send = function(body) {
            const responseTime = Date.now() - startTime;
            logger.info('backend', 'middleware', 
                `Request completed in ${responseTime}ms with status ${res.statusCode}`);
            return originalSend.call(this, body);
        };

        next();
    } catch (error) {
        logger.error('backend', 'middleware', 
            `Error in logging middleware: ${error instanceof Error ? error.message : 'Unknown error'}`);
        next();
    }
};