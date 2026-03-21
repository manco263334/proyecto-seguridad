import { z } from "zod";
import type { SchemaPartialParser, SchemaPartialParserOptionsProps } from '../types/types.d.ts';

export const productCreateSchema = z.object({
    name: z.string(),
    description: z.string().optional(),
    price: z.float32(),
    stock: z.int32().default(0)
});

export const productUpdateSchema = z.object({
    name: z.string(),
    description: z.string(),
    price: z.float32(),
    stock: z.int32()
}).partial();

export const ProductSchema: SchemaPartialParser = (options: SchemaPartialParserOptionsProps = { isPartial: false }) => {
    return options.isPartial ? productCreateSchema.safeParseAsync : productUpdateSchema.safeParseAsync;
} 