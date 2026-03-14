import 'dotenv/config';
import { PrismaBetterSqlite3 } from '@prisma/adapter-better-sqlite3';
import { PrismaClient } from '../generated/prisma/client.ts';
import { logger } from '../utils/logger.ts';

logger.info('Se entró al archivo de la base de datos');

const connectionString = `${process.env.DATABASE_URL}`;

const adapter = new PrismaBetterSqlite3({ url: connectionString });
logger.info('Se creó la conexión a la base de datos');

export const prisma = new PrismaClient({ adapter });
logger.info('Se exportó la base de datos');