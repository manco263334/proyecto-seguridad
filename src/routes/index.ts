import { Router } from 'express';
import { router as AuthRouter } from './auth.ts';
import { router as UserRouter } from './user.ts';
import { router as InvoiceRouter } from './invoice.ts';
import { router as ProfileRouter } from './profile.ts';
import { router as ProductRouter } from './product.ts';
import container from '../utils/container.ts';

const { jwt } = container;
const getData = jwt.getUserData;

export const router = Router();

router.use('/auth', AuthRouter);

router.use('/users', getData, UserRouter);

router.use('/invoices', getData, InvoiceRouter);

router.use('/profiles', getData, ProfileRouter);

router.use('/products', getData, ProductRouter);