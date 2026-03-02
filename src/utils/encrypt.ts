import bcrypt from 'bcrypt';
import { SALT } from '../constants/encrypt.ts';

export async function encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(Number(SALT));
    return bcrypt.hash(password, salt);
}

export async function validatePassword(password: string, hashedPassword: string) {
    return bcrypt.compare(password, hashedPassword);
}