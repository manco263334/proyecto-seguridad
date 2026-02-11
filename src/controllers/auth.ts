import type { Request, Response } from "express";
import type { Controller, User } from "../types/types.d.ts";
import { encryptPassword } from "../utils/encrypt.ts";

export default class AuthController {
    private controller: Controller<User>;

    constructor (controller: Controller<User>) {
        this.controller = controller;
    }

    register = async (req: Request<unknown, any, User>, res: Response) => {
        const data = req.body;
        const passwordEncrypted = await encryptPassword(data.password);
        data.password = passwordEncrypted;
        req.body = data;

        this.controller.create(req as Request, res);
    }
}