import type { StringValue } from 'ms';
import type { Algorithm } from 'jsonwebtoken';
import { JWT_SECRET, ALGORITHM } from '../constants/api.ts';
import Logger from './logger.ts';
import jwt from 'jsonwebtoken';

const LoggerClass = new Logger;

export const generateToken = async (payload: string | object | Buffer, expiresIn: StringValue = '1d') => {
    try {
        LoggerClass.logger.info('Se entró al apartado para crear el token');

        return jwt.sign(payload, JWT_SECRET!, { expiresIn, algorithm: ALGORITHM as Algorithm });
    } catch (error) {
        LoggerClass.logger.warn(`Error al generar el jwt: ${error}`);

        throw error;
    }
};

export const verifyToken = async (token: string) => {
    try {
        LoggerClass.logger.info('Se entró al apartado para verificar token');

        return jwt.verify(token, JWT_SECRET!);
    } catch (error) {
        LoggerClass.logger.warn(`Error al verificar el jwt: ${error}`);

        throw error;
    }
};