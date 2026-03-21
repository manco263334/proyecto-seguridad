import { z } from 'zod';
import type { SchemaPartialParser, SchemaPartialParserOptionsProps } from '../types/types.d.ts';

const roles = ['USUARIO', 'ADMIN'] as const;

export const userCreateSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(10),
    role: z.enum(roles).default('USUARIO')
});

export const userUpdateSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(10),
    role: z.enum(roles)
}).partial();

export const UserSchema: SchemaPartialParser = (options: SchemaPartialParserOptionsProps = { isPartial: false }) => {
    return options.isPartial ? userUpdateSchema.safeParseAsync : userCreateSchema.safeParseAsync;
}

const types = ['CLIENTE', 'VENDEDOR'] as const;

export const ProfileSchema = z.object({
    name: z.string(),
    type: z.enum(types),
    taxId: z.string(),
    address: z.string().optional(),
    userId: z.uuid()
});