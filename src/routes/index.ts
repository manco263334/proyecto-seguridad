import { Router } from 'express';
import { router as AuthRouter } from './auth.ts';
import { router as UserRouter } from './user.ts';

export const router = Router();

router.use('/auth', AuthRouter);

router.use('/users', UserRouter);