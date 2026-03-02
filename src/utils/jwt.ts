import type { StringValue } from "ms";
import type { Algorithm } from "jsonwebtoken";
import { JWT_SECRET, ALGORITHM } from "../constants/api.ts";
import jwt from 'jsonwebtoken';

export const generateToken = async (payload: string | object | Buffer, expiresIn: StringValue = '1d') => {
    try {
        return jwt.sign(payload, JWT_SECRET!, { expiresIn, algorithm: ALGORITHM as Algorithm });
    } catch (error) {
        console.log(`Error al generar el jwt: ${error}`);
        throw error;
    }
};

export const verifyToken = async (token: string) => {
    try {
        return jwt.verify(token, JWT_SECRET!);
    } catch (error) {
        console.log(`Error al verificar el jwt: ${error}`);
        throw error;
    }
};