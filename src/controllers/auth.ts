import type { NextFunction, Request, Response } from 'express';
import type { Controller, TypeWithId, Repository, User } from '../types/types.d.ts';
import { encryptPassword, validatePassword } from '../utils/encrypt.ts';
import { generateToken } from '../utils/jwt.ts';
import { AUTH_TOKEN_NAME as AUTH_TOKEN, NODE_ENV } from '../constants/api.ts';
import Logger from '../utils/logger.ts';
const LoggerClass = new Logger;

export default class AuthController {
    private controller: Controller<User>;
    private repository: Repository<User>

    constructor (controller: Controller<User>, repository: Repository<User>) {
        this.controller = controller;
        this.repository = repository;

        this.register = this.register.bind(this);
        this.login = this.login.bind(this);
        this.logOut = this.logOut.bind(this);
        this.me = this.me.bind(this);
    }

    async register (req: Request<unknown, any, User>, res: Response) {
        LoggerClass.logger.info('Se entró al endpoint de registro');

        const data = req.body;
        const passwordEncrypted = await encryptPassword(data.password);
        data.password = passwordEncrypted;
        req.body = data;

        return this.controller.create(req as Request, res);
    }

    async login (req: Request<unknown, any, Pick<User,'email' | 'password'>>, res: Response, next: NextFunction) {
        LoggerClass.logger.info('Se entró al endpoint de login');

        const data = req.body;
        const response = await this.repository.getByField({ fieldName: 'email', fieldFinder: data.email, limit: 1 });

        const user = response.data as TypeWithId<User>;
        const { password, ...userWithNoPassword } = user;

        const isCorrectPassword = await validatePassword(data.password, password);

        if (!isCorrectPassword) {
            return next({ statusCode: 400, message: 'Credenciales inválidas' });
        }

        const token = await generateToken({ id: user.id, permissions: user.role }, '7d');

        res.cookie(AUTH_TOKEN, token, { 
            httpOnly: true, 
            sameSite: NODE_ENV === 'production' ? 'none' : undefined, 
            secure: NODE_ENV === 'production', 
            path: '/',
            maxAge: 1000 * 60 * 60 * 24 * 7
        }).status(200).json({ message: 'Login ok', data: userWithNoPassword });
    }

    async logOut (_req: Request, res: Response) {
        LoggerClass.logger.info('Se entró al endpoint de logout');

        res.clearCookie(AUTH_TOKEN);
        res.status(200).json({ message: 'Sesión cerrada con éxito' });
    }

    async me (req: Request, res: Response, next: NextFunction) {
        const user = req.session?.user;

        if (!user) {
            next({ statusCode: 401, message: 'Usuario no identificado' });
        } else {
            res.status(200).json({ data: user, message: 'Usuario identificado correctamente' })
        }
    }
}