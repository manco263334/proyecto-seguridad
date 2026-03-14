import type { User } from '../types/types.d.ts';
import { Router } from 'express';
import { prisma } from '../constants/db.ts';
import { UserSchema } from '../schemas/user.ts';
import { validationFactory } from '../utils/validationFactory.ts';
//import Limiters from '../middlewares/rateLimiter.ts';
import UC from '../controllers/user.ts';
import FR from '../repositories/factory.ts';

const UserRepository = new FR(prisma).getRepository<User>('user');
const UserController = new UC(UserRepository);
const UserValidator = ({ isPartial = false } = {}) => 
    validationFactory({ isPartial, schema: UserSchema, repository: UserRepository });

export const router = Router();

router.get(
    '/',
    //Limiters.defaultLimiter,
    UserValidator().validatePermissions({ acceptedPermissions: ['admin'] }),
    UserController.getAll
);

router.post(
    '/',
    UserValidator().validateData,
    UserValidator().validateExistenceByField({ fieldName: 'email', shouldExists: false }),
    UserController.create
);

router.use(
    '/:id',
    UserValidator().validateExistenceByID,
    UserValidator().validatePermissions({ acceptedPermissions: '*', matchId: true, excludedPermissionsFromMatchId: ['admin'] })
);

router.get(
    '/:id',
    UserController.getById
);

router.put(
    '/:id',
    UserValidator({ isPartial: true }).validateData,
    UserController.updateById
);

router.delete(
    '/:id',
    UserController.deleteById
);