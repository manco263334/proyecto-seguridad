import type { Request, Response, NextFunction } from "express";
import type { Invoice } from "../types/types.d.ts";
import InvoiceRepository from "../repositories/invoice.ts";

export default class InvoiceController {
    repository: InvoiceRepository;

    constructor (repository: InvoiceRepository) {
        this.repository = repository;
    }

    create = async (req: Request, res: Response, next: NextFunction) => {
        const { issuerId, recipientId, items } = req.body as Invoice & { items: Array<{ productId: string; quantity: number }> };

        const result = await this.repository.createFullInvoice({
            issuerId,
            recipientId,
            items
        });

        if (!result.success) {
            return next({ statusCode: 400, error: result.error });
        }

        res.status(201).json({
            message: "Factura generada con éxito",
            data: result.data
        });
    }
}