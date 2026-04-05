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

        interface Item {
            productId: string
            quantity: number
        }

        const { items } = body as any;

        const isItemsArray = (items: any): items is Array<Item> => {
            if (Array.isArray(items)) {
                return items.length > 0 && items.every(item => Object.hasOwn(item, 'productId') && Object.hasOwn(item, 'quantity'));
            } else {
                try {
                    const parsed = JSON.parse(items);
                    return Array.isArray(parsed) ? isItemsArray(parsed) : false;
                } catch {
                    return false;
                }
            }
        }

        const validations = [
            (items: any) => items !== undefined && items !== null,
            (items: any) => isItemsArray(items)
        ];

        const all = validations.every(Boolean);

        if (!all) {
            return next({ statusCode: 400, message: 'Se necesita especificar al menos un producto' });
        }

        const parseItems = (items: any): Array<Item> => 
            items.map((item: any) => ({ productId: item.productId, quantity: item.quantity }));

        const parsedItems = parseItems(items);

        await Promise.all(parsedItems.map(async item => {
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