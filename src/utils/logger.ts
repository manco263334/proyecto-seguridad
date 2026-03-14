import { NODE_ENV } from '../constants/api.ts';
import { LOG_LEVEL } from '../constants/logger.ts';
import winston, { transports, format } from 'winston';
import path from 'path';

const logDir = path.join(__dirname, '..', 'logs');

export const logger =  winston.createLogger({
    level: LOG_LEVEL|| 'info',
    format: format.combine(
        format.timestamp(),
        format.errors({ stack: true }),
        format.json()
    ),
    transports: [
        new transports.File({
            filename: `${logDir}/trace.log`,
            level: 'trace'
        }),
        new transports.File({
            filename: `${logDir}/debug.log`,
            level: 'debug'
        }),
        new transports.File({
            filename: `${logDir}/info.log`,
            level: 'info'
        }),
        new transports.File({
            filename: `${logDir}/warn.log`,
            level: 'warn'
        }),
        new transports.File({
            filename: `${logDir}/error.log`,
            level: 'error'
        }),
        new transports.File({
            filename: `${logDir}/fatal.log`,
            level: 'fatal'
        }),
        new transports.File({
            filename: `${logDir}/combined.log`
        })
    ]
});

if (NODE_ENV !== 'production') {
    logger.add(new transports.Console({
        format: format.simple()
    }));
}