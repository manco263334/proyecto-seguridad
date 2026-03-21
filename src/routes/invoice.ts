import type { Profile, Product } from "../types/types.d.ts";
import type { NextFunction, Request, Response } from "express";
import { Router } from "express";
import { ProfileSchema } from "../schemas/user.ts";
import { ProductSchema } from "../schemas/product.ts";
import ValidationMiddlewares from "../middlewares/validations.ts";
import container from '../utils/container.ts';

const ProfileRepository = container.getRepository<Profile>('profile');
const ProfileValidator = new ValidationMiddlewares(ProfileSchema.safeParseAsync, ProfileRepository);

const ProductRepository = container.getRepository<Product>('product');
const ProductValidator = new ValidationMiddlewares(ProductSchema(), ProductRepository);

export const router = Router();

router.post(
    '/',
    ProfileValidator.validateExistenceById({ idName: 'issuerId' }),
    ProfileValidator.validateExistenceById({ idName: 'recipientId' }),
    async (req: Request<unknown, any, any>, res: Response, next: NextFunction) => {
        const { body } = req;
        const { items } = body as { items: Array<{ productId: string; quantity: number }> };

        if (!items || items.length === 0) {
            return next({ statusCode: 400, error: "La factura debe tener al menos un producto" });
        }

        await Promise.all(items.map(async item => {
            req.body = item;

            await ProductValidator.validateExistenceById({ idName: 'productId', callNext: false })(req as Request, res, next);
        }));

        req.body = body;
        next();
    },
    (_req, res, _next) => {
        res.status(200).json({ message: 'Este es un mensaje de prueba, todo salio como se esperaba, puedes continuar el código' });
    }
);