import { Router } from 'express';
import { UserSchema } from '../schemas/user.ts';
import { validationFactory } from '../utils/validationFactory.ts';
import container from '../utils/container.ts';
//import Limiters from '../middlewares/rateLimiter.ts';

const { UserRepository, AuthController } = container;

const UserValidator = validationFactory({ isPartial: false, schema: UserSchema, repository: UserRepository });

export const router = Router();

router.post(
    '/register',
    //Limiters.defaultLimiter,
    UserValidator.validateData(),
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