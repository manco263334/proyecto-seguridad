import { Router } from 'express';
import { UserSchema } from '../schemas/user.ts';
import { validationFactory } from '../utils/validationFactory.ts';
import container from '../utils/container.ts';
//import Limiters from '../middlewares/rateLimiter.ts';

const { UserRepository, UserController } = container;

const UserValidator = ({ isPartial = false } = {}) => 
    validationFactory({ isPartial, schema: UserSchema, repository: UserRepository });

export const router = Router();

router.get(
    '/',
    //Limiters.defaultLimiter,
    UserValidator().validatePermissions({ acceptedPermissions: ['ADMIN'] }),
    UserController.getAll
);

router.use(
    '/:id',
    UserValidator().validateExistenceById(),
    UserValidator().validatePermissions({ acceptedPermissions: '*', matchId: true, excludedPermissionsFromMatchId: ['ADMIN'] })
);

router.get(
    '/:id',
    UserController.getById
);

router.put(
    '/:id',
    UserValidator({ isPartial: true }).validateData(),
    UserController.updateById
);

router.delete(
    '/:id',
    UserController.deleteById
);