import 'dotenv/config';

export const {
    PORT = 3000,
    JWT_SECRET,
    ALGORITHM = 'HS256',
    AUTH_TOKEN_NAME = 'AUTH_TOKEN',
    NODE_ENV = 'development'
} = process.env;