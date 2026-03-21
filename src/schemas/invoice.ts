import { z } from "zod";
import type { SchemaPartialParser, SchemaPartialParserOptionsProps } from '../types/types.d.ts';

const status = ['PENDING', 'PAID', 'CANCELLED'] as const;

export const invoiceCreateSchema = z.object({
    number: z.number(),
    createdAt: z.date().default(new Date()),
    dueDate: z.date(),
    taxRate: z.float32().default(0.16),
    totalAmount: z.float32(),
    status: z.enum(status).default('PENDING'),

    issuerId: z.uuid(),
    recipientId: z.uuid()
});

export const invoiceUpdateSchema = z.object({
    number: z.number(),
    dueDate: z.date(),
    taxRate: z.float32(),
    totalAmount: z.float32(),
    status: z.enum(status)
}).partial();

export const InvoiceSchema: SchemaPartialParser = (options: SchemaPartialParserOptionsProps = { isPartial: false }) => {
    return options.isPartial ? invoiceCreateSchema.safeParseAsync : invoiceUpdateSchema.safeParseAsync;
} 

export const InvoiceItemSchema = z.object({
    quantity: z.int32(),
    unitPrice: z.float32(),
    subtotal: z.float32(),

    invoiceId: z.uuid(),
    productId: z.uuid()
});