import type { ControllerParsers, User } from "../types/types.d.ts";
import { PrismaClient } from "../generated/prisma/client.ts";
import { prisma } from "../constants/db.ts";
import Logger from "./logger.ts";
import FactoryController from "../controllers/factory.ts";
import FactoryRepository from "../repositories/factory.ts";
import JWTMiddlewares from "../middlewares/jwt.ts";
import UC from "../controllers/user.ts";
import AC from "../controllers/auth.ts";
import IR from "../repositories/invoice.ts";

const UserRepository = new FactoryRepository(prisma).getRepository<User>('user');
const UserController = new UC(UserRepository);
const AuthController = new AC(UserController, UserRepository);
const InvoiceRepository = new IR(prisma);

const jwt = new JWTMiddlewares(UserRepository);
const LoggerClass = new Logger;

const container = {
    db: prisma,
    LoggerClass,
    UserRepository,
    UserController,
    AuthController,
    InvoiceRepository,
    jwt,

    getRepository: <T>(modelName: keyof PrismaClient) => new FactoryRepository(container.db).getRepository<T>(modelName),
    getController: <T>(modelName: keyof PrismaClient, parsers?: ControllerParsers<T>) => new FactoryController<T>(container.getRepository(modelName), parsers)
} as const;

export default container;