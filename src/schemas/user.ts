import { z } from 'zod';
import type { SchemaPartialParser, SchemaPartialParserOptionsProps } from '../types/types';

const roles = ['cliente', 'admin'] as const;

const userCreateSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(10),
    role: z.enum(roles).default('cliente')
});

const userUpdateSchema = z.object({
    email: z.email(),
    password: z.string().min(8).max(10),
    role: z.enum(roles)
}).partial();

export const UserSchema: SchemaPartialParser = (options: SchemaPartialParserOptionsProps = { isPartial: false }) => {
    return options.isPartial ? userUpdateSchema.safeParseAsync : userCreateSchema.safeParseAsync;
}