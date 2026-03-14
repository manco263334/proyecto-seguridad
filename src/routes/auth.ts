import type { User } from '../types/types.d.ts';
import { Router } from 'express';
import { UserSchema } from '../schemas/user.ts';
import { prisma } from '../constants/db.ts';
import UR  from '../repositories/factory.ts'
import VM from '../middlewares/validations.ts';
import UC from '../controllers/user.ts';
import AC from '../controllers/auth.ts';
//import Limiters from '../middlewares/rateLimiter.ts';

const UserRepository = new UR(prisma).getRepository<User>('user');

const UserValidator = new VM(UserSchema(), UserRepository);

const UserController = new UC(UserRepository);

const AuthController = new AC(UserController, UserRepository);

export const router = Router();

router.post(
    '/register',
    //Limiters.defaultLimiter,
    UserValidator.validateData,
    UserValidator.validateExistenceByField({ fieldName: 'email', shouldExists: false }),
    AuthController.register
);

router.post(
    '/login',
    UserValidator.validateExistenceByField({ fieldName: 'email', shouldExists: true }),
    AuthController.login
);

router.post(
    '/logout',
    AuthController.logOut
);

router.get(
    '/me',
    AuthController.me
);