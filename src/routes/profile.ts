import type { Profile } from "../types/types.d.ts";
import { Router } from "express";
import { validationFactory } from "../utils/validationFactory.ts";
import { UserSchema, ProfileSchema } from "../schemas/user.ts";
import ValidationMiddlewares from "../middlewares/validations.ts";
import container from "../utils/container.ts";

const ProfileRepository = container.getRepository<Profile>('profile');
const ProfileController = container.getController<Profile>('profile');

const { UserRepository } = container;

const UserValidator = new ValidationMiddlewares(UserSchema(), UserRepository);
const ProfileValidator = ({ isPartial = false } = {}) =>
    validationFactory({ isPartial, schema: ProfileSchema, repository: ProfileRepository });

export const router = Router();

router.post(
    '/',
    UserValidator.validateExistenceById({ idName: 'userId' }),
    ProfileValidator().validateData(),
    ProfileController.create
);

router.get(
    '/',
    ProfileController.getAll
);