import type { StringValue } from 'ms';
import type { Algorithm } from 'jsonwebtoken';
import { JWT_SECRET, ALGORITHM } from '../constants/api.ts';
import { logger } from './logger.ts';
import jwt from 'jsonwebtoken';

export const generateToken = async (payload: string | object | Buffer, expiresIn: StringValue = '1d') => {
    try {
        logger.info('Se entró al apartado para crear el token')
        return jwt.sign(payload, JWT_SECRET!, { expiresIn, algorithm: ALGORITHM as Algorithm });
    } catch (error) {
        logger.error(`Error al generar el jwt: ${error}`);
        throw error;
    }
};

export const verifyToken = async (token: string) => {
    try {
        logger.info('Se entró al apartado para verificar token');
        logger.debug(`Valor del token: ${token}`)
        return jwt.verify(token, JWT_SECRET!);
    } catch (error) {
        logger.error(`Error al verificar el jwt: ${error}`);
        throw error;
    }
};