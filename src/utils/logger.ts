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

const customFormat = format.printf(({ level, message, timestamp, stack }: Record<string, any>) => {
    // Si el mensaje es un objeto (como los de error o debug que pasaste), lo convertimos a string
    const logMessage = typeof message === 'object' ? JSON.stringify(message) : message;

    // Si hay un stack trace (errores), lo añadimos al mensaje
    const content = stack ? `${logMessage} - ${stack}` : logMessage;

    // Limpiamos el timestamp para que se vea más amigable (opcional, quita .split si quieres el ISO completo)
    const cleanTime = timestamp.replace('T', ' ');

    return `[${cleanTime}] | [${level.toUpperCase()}] | ${content}`;
});

export default class Logger {
    private logLevel: LogLevel = 'debug';

    public logger = winston.createLogger({
        level: this.logLevel,
        format: format.combine(
            format.timestamp(),
            format.errors({ stack: true }),
            customFormat
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
                format: format.combine(
                    format.timestamp(),
                    customFormat
                )
            }));
        }
    }

    setLogLevel = (level: LogLevel) => { this.logLevel = level; this.logger.level = level; };
}