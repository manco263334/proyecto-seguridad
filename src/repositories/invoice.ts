import type { PrismaClient } from "../generated/prisma/client.ts";
import type { Invoice, PrismaDelegate, Success, Error, ReturnType } from "../types/types.d.ts";
import { BaseRepository } from "./factory.ts";

export default class InvoiceRepository extends BaseRepository<Invoice> {
    constructor(prisma: PrismaClient) {
        const delegate = prisma.invoice as PrismaDelegate;
        super(delegate, prisma)
    }

    createFullInvoice = async (data: {
        issuerId: string;
        recipientId: string;
        items: Array<{ productId: string; quantity: number }>;
    }): Promise<ReturnType<Invoice>> => {
        return this.prisma!.$transaction(async (transaction) => {
            let totalAmount = 0;
            const invoiceItemsData = [];

            // 1. Validar productos y calcular montos
            for (const item of data.items) {
                const product = (await transaction.product.findUnique({ where: { id: item.productId } }))!;

                const subtotal = product.price * item.quantity;
                totalAmount += subtotal;

                invoiceItemsData.push({
                    productId: item.productId,
                    quantity: item.quantity,
                    unitPrice: product.price,
                    subtotal: subtotal
                });
            }

            // 2. Crear la Factura y sus detalles
            const result = await transaction.invoice.create({
                data: {
                    number: `FAC-${Date.now()}`, // Generación de folio simple
                    dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Vence en 7 días
                    totalAmount: totalAmount * 1.16, // Aplicando IVA del 16%
                    issuerId: data.issuerId,
                    recipientId: data.recipientId,
                    items: {
                        create: invoiceItemsData,
                    }
                },
                include: { items: true },
            });

            return { success: true, data: result } as Success<Invoice>;
        });
    }
}