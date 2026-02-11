import { z } from 'zod';

export const UserSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(10),
    role: z.enum(['cliente']).default('cliente')
});