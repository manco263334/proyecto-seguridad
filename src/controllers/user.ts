import type { NextFunction, Request, Response } from "express";
import type { Repository, User, ControllerParsers } from "../types/types.d.ts";
import { encryptPassword } from "../utils/encrypt.ts";
import FactoryController from "./factory.ts";

export default class UserController extends FactoryController<User> {
    constructor (repository: Repository<User>) {
        const basicParser = async (data: User): Promise<Omit<User, 'password'>> => {
            const { password, ...user } = data;
            return user;
        }
        const parsers = {
            parserCreate: basicParser,
            parserGet: basicParser,
            parserUpdate: async (data) => {
                if (data.password) {
                    const { password, ...user } = data;
                    return user;
                }

                return data;
            },
            parserGetAll: async (data) => Promise.all(data.map(basicParser))
        } as ControllerParsers<User>;
        super(repository, parsers);
    }

    override async updateById (req: Request<any, any, PartialOrComplete<User>>, res: Response, next: NextFunction): Promise<void> {
        const data = req.body;

        if (data.password) {
            const hashedPassword = await encryptPassword(data.password);
            data.password = hashedPassword;
        }

        return super.updateById(req, res, next);
    }
}