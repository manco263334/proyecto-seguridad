import { Request, Response } from "express";

declare global {
    /**
     * Make properties specified in K, optional in T
     */
    type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
    type PartialOrComplete<T> = T | Partial<T>;
    type Nullable<T> = T | null | undefined;
}

export type Role = 'cliente';

export interface User {
    email: string
    password: string
    role: Role
}

export interface Controller<T> {
    create(req: Request, res: Response): Promise<void>

    getAll(req: Request, res: Response): Promise<void>

    getById(req: Request, res: Response): Promise<void>

    updateById(req: Request, res: Response): Promise<void>

    deleteById(req: Request, res: Response): Promise<void>
}

export interface Repository<T> {
    create(data: T): Promise<ReturnType<T>>

    getAll(): Promise<ReturnType<Array<T>>>

    getByField(delimiters: GetByFieldDelimiters): Promise<ReturnType<Array<T>>>

    getById(id: number): Promise<ReturnType<Nullable<T>>>

    updateById(id: number, data: PartialOrComplete<T>): Promise<ReturnType<PartialOrComplete<T>>>

    deleteById(id: number): Promise<ReturnType<Nullable<T>>>
}

export interface GetByFieldDelimiters {
    fieldName: string
    fieldFinder: string
    limit: number
}

export interface Success<T> {
    success: true
    data: T
}

export interface Error<T> {
    success: false
    error: any
}

export type ReturnType<T> = Success<T> | Error<T>;

export type Validator<Input, Output> = (data: unknown) => Promise<SafeParseReturnType<Input, Output>>;

export interface PrismaDelegate {
    create: (args: any) => Promise<any>;
    findMany: (args?: any) => Promise<Array<any>>;
    findFirstOrThrow: (args: any) => Promise<any>;
    delete: (args: any) => Promise<any>;
    update: (args: any) => Promise<any>;
}