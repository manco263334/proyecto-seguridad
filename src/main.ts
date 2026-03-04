import type { User } from './types/types.d.ts';
import { PORT } from './constants/api.ts';
import { router as routes } from './routes/index.ts';
import { prisma } from './constants/db.ts';
import express, { json, urlencoded } from 'express';
import type { Request, Response, NextFunction } from 'express';

import cors from 'cors';
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";

import JWTMiddlewares from './middlewares/jwt.ts';
import FactoryRepository from './repositories/factory.ts';

const BASE_URL = '/api';
const UserRepository = new FactoryRepository(prisma).getRepository<User>('user');
const jwt = new JWTMiddlewares(UserRepository);

const app = express();

app.disable("x-powered-by");

const initializers = [
    compression(),
    json(),
    cookieParser(),
    helmet(),
    cors({ credentials: true }),
    urlencoded({ extended: true }),
    jwt.getUserData
];

app.use(initializers);

app.use(`${BASE_URL}`, routes);

app.get('/', (_req, res) => {
    res.send(`
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
        </style>
        <div style="font-family: sans-serif; text-align: center; min-width: 100vw; min-height: 100vh; display: flex; justify-content: center; align-items: center; background-color:rgb(240, 186, 77); flex-direction: column;">
            <h1 style="color: green; font-size: 48px;">✅ API is <span style="color: #007bff;">RUNNING</span></h1>
            <p style="font-size: 24px;">Everything looks good 🚀</p>
        </div>
    `);
});

app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const { statusCode, ...errors } = err
    res.status(statusCode).json({ ...errors });
})

app.listen(PORT, () => {
    console.log(`
        ███████╗██████╗ ██╗███╗   ██╗██╗███████╗███████╗
        ██╔════╝██╔══██╗██║████╗  ██║██║██╔════╝██╔════╝
        █████╗  ██████╔╝██║██╔██╗ ██║██║█████╗  ███████╗
        ██╔══╝  ██╔═══╝ ██║██║╚██╗██║██║██╔══╝  ╚════██║
        ███████╗██║     ██║██║ ╚████║██║███████╗███████║
        ╚══════╝╚═╝     ╚═╝╚═╝  ╚═══╝╚═╝╚══════╝╚══════╝
        API is running on port ${PORT} 🚀
    `);
});