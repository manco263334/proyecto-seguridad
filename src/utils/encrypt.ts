import bcrypt from 'bcrypt';
import { SALT } from '../constants/encrypt.ts';

export async function encryptPassword(password: string) {
    const salt = await bcrypt.genSalt(Number(SALT));
    return bcrypt.hash(password, salt);
}