import type { Product } from '../types/types.d.ts';
import { Router } from 'express';
import { ProductSchema } from '../schemas/product.ts';
import { validationFactory } from '../utils/validationFactory.ts';
import container from '../utils/container.ts';

const ProductRepository = container.getRepository<Product>('product');
const ProductController = container.getController<Product>('product');
const ProductValidator = ({ isPartial = false } = {}) =>
    validationFactory({ isPartial, schema: ProductSchema, repository: ProductRepository });

export const router = Router();

router.post(
    '/',
    ProductValidator().validateData,
    ProductController.create
);