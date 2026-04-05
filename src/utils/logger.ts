import { NODE_ENV } from '../constants/api.ts';
import { fileURLToPath } from 'url'; // Importa esto
import winston, { transports, format } from 'winston';
import path from 'path';

// Estas dos líneas simulan el __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ahora tu código ya no dará error
const logDir = path.join(__dirname, '..', 'logs');

type LogLevel = 'trace' | 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export default class Logger {
    private logLevel: LogLevel = 'debug';

    public logger = winston.createLogger({
        level: this.logLevel,
        format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            format.json()
        ),
        transports: [
            new transports.File({
                filename: `${logDir}/app.log`
            })
        ]
    });

    constructor () {
        if (NODE_ENV !== 'production') {
            this.logger.add(new transports.Console({
                format: format.simple()
            }));
        }
    }

    setLogLevel = (level: LogLevel) => { this.logLevel = level };
}