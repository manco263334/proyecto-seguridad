import { Request, Response, type NextFunction } from 'express';
import { z, ZodObject, ZodSafeParseResult } from 'zod';

declare global {
    /**
     * Make properties specified in K, optional in T
     */
    type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
    type PartialOrComplete<T> = T | Partial<T>;
    type Nullish<T> = T | null | undefined;

    namespace Express {
        interface Session {
            user?: { 
                id: number
                permissions: Role
            }
        }

        interface Request {
            session: Session
        }
    }
}

export type Role = 'cliente' | 'admin'

export interface User {
    email: string
    password: string
    role: Role
}

export interface ControllerParsers<Input> {
    parserCreate?: <Output>(data: Input) => Promise<Output>
    parserUpdate?: <Output>(data: PartialOrComplete<Input>) => Promise<PartialOrComplete<Output>>
    parserGet?: <Output>(data: Input) => Promise<Output>
    parserGetAll?: <Output>(data: Array<Input>) => Promise<Array<Output>>
}

export interface Controller<T> {
    create(req: Request, res: Response, next?: NextFunction): Promise<void>

    getAll(req: Request, res: Response, next?: NextFunction): Promise<void>

    getById(req: Request, res: Response, next?: NextFunction): Promise<void>

    updateById(req: Request, res: Response, next?: NextFunction): Promise<void>

    deleteById(req: Request, res: Response, next?: NextFunction): Promise<void>
}

export interface GetAllDelimiters {
    where?: Record<string, any>, 
    take?: number, 
    skip?: number
}

export interface GetByFieldDelimiters {
    fieldName: string;
    fieldFinder: string;
    limit: number;
}

export interface Repository<T> {
    create(data: T): Promise<ReturnType<T>>

    getAll(delimiters?: GetAllDelimiters): Promise<ReturnType<Array<T>>>

    getByField(delimiters: GetByFieldDelimiters): Promise<ReturnType<Array<T> | Nullish<T>>>

    getById(id: number): Promise<ReturnType<Nullish<T>>>

    updateById(id: number, data: PartialOrComplete<T>): Promise<ReturnType<PartialOrComplete<T>>>

    deleteById(id: number): Promise<ReturnType<Nullish<T>>>
}

export interface Success<T> {
    success: true
    data: T
}

export interface Error<T> {
    success: false
    error: any
    [key: string]: any
}

export type ReturnType<T> = Success<T> | Error<T>;

export type SafeParseReturnType<Output> = {
    success: true
    data: Readonly<Output>
} | {
    success: false
    error: any
}

export type TypeWithId<T> = T & {
    id: number
}

type TypeWithoutId<T extends TypeWithId> = Omit<T, 'id'>

export type Validator<Output = unknown> = (data: unknown, params?: z.core.ParseContext<z.core.$ZodIssue> | undefined) => Promise<SafeParseReturnType<Output>>

export interface SchemaPartialParserOptionsProps {
    isPartial: boolean
}

export type SchemaPartialParser<Output = unknown> = (options?: SchemaPartialParserOptionsProps) => (data: unknown, params?: z.core.ParseContext<z.core.$ZodIssue> | undefined) => Promise<SafeParseReturnType<Output> | ZodSafeParseResult>

export interface PrismaDelegate {
    create: <Output = unknown>(args: any) => Promise<Output>
    findMany: <Output = unknown>(args?: any) => Promise<Array<Output>>
    findFirst: <Output = unknown>(args: any) => Promise<Output>
    delete: <Output = unknown>(args: any) => Promise<Output>
    update: <Output = unknown>(args: any) => Promise<PartialOrComplete<Output>>
    count: <Output = unknown>(args: any) => Promise<Output>
}