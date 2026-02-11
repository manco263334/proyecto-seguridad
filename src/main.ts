import { PORT } from './constants/api.ts';

import express, { json, urlencoded } from 'express';

import cors from 'cors';
import helmet from "helmet";
import compression from "compression";
import cookieParser from "cookie-parser";
import routes from './routes/index.ts';

const BASE_URL = '/api';

const app = express();

app.disable("x-powered-by");

app.use(compression());
app.use(json());
app.use(cookieParser());
app.use(helmet());
app.use(cors());
app.use(cors());
app.use(urlencoded({ extended: true }));

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

app.use(`${BASE_URL}/auth`, routes.AuthRouter);

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