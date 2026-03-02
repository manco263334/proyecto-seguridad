import type { NextFunction, Request, Response } from "express";
import type { Controller, Repository, ControllerParsers, Success } from "../types/types.d.ts";
import { parseId, parseQueryParams } from "../utils/parser.ts";

export default class FactoryController<T> implements Controller<T> {
    protected repository: Repository<T>;
    private parsers?: ControllerParsers<T>

    constructor (repository: Repository<T>, parsers?: ControllerParsers<T>) {
        this.repository = repository;
        this.parsers = parsers;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.updateById = this.updateById.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    async create (req: Request<unknown, any, T>, res: Response, next: NextFunction) {
        const body = req.body;
        const result = await this.repository.create(body);

        if (!result.success) 
            return next({ statusCode: 500, message: 'Ocurrió un error al crear el elemento, lamentamos las molestias', error: result.error });

        const data = await this.parsers?.parserCreate?.<T>(result.data) ?? result.data;

        res.status(201).json({ message: "Elemento creado correctamente", data });
    }

    private getAllMessageError = (error: unknown, next: NextFunction) => {
        const message = error instanceof Error ? error.message : '';

        const errorMap: Array<{ keyword: string; response: { statusCode: number; message: string }}> = [
            {
                keyword: 'Unknown argument',
                response: {
                    statusCode: 400,
                    message: 'Uno de los filtros enviados no es válido para este recurso.'
                }
            },
            {
                keyword: 'Invalid value provided',
                response: {
                    statusCode: 400,
                    message: 'Uno de los filtros enviados tiene un tipo de dato distinto al esperado'
                }
            }
        ];

        const matchedError = errorMap.find(e => message.includes(e.keyword));

        return next(
            matchedError?.response ?? {
                statusCode: 500,
                message: 'Error interno',
                error
            }
        );
    };

    async getAll (req: Request, res: Response, next: NextFunction) {
        const { limit, page, ...filters } = await parseQueryParams(req.query);
        const take = limit ? Number(limit) : undefined;
        const skip = (page && limit) ? (Number(page) - 1) * Number(limit) : undefined;

        const result = await this.repository.getAll({
            where: filters,
            take,
            skip
        });

        if (!result.success) {
            return this.getAllMessageError(result.error, next);
        }

        const { total } = result as Success<Array<T>> & { total: number };
        const data = await this.parsers?.parserGetAll?.<T>(result.data) ?? result.data;

        res.status(200).json({ 
            message: "Elementos obtenidos", 
            data,
            meta: {
                page: Number(page) || 1,
                limit: take,
                lastPage: take ? Math.ceil(total / take) : 1
            } 
        });
    }

    async getById (req: Request, res: Response, next: NextFunction) {
        const id = await parseId(req.params.id);
        const result = await this.repository.getById(id);

        if (!result.success) 
            return next({ statusCode: 500, message: "Ocurrió un error al consultar el elemento, lamentamos lo sucedido", error: result.error });

        const body = result.data as T;
        const data = await this.parsers?.parserGet?.<T>(body) ?? body;

        res.status(200).json({ message: "Elemento recuperado", data });
    }

    async updateById (req: Request<any, any, PartialOrComplete<T>>, res: Response, next: NextFunction) {
        const id = await parseId(req.params.id);
        const body = req.body;

        const result = await this.repository.updateById(id, body);

        if (!result.success) 
            return next({ statusCode: 500, message: "Ocurrió algo inesperado mientras se actualizaba el elemento, lamentamos lo sucedido", error: result.error });

        const data = await this.parsers?.parserUpdate?.<T>(result.data) ?? result.data;

        res.status(200).json({ message: "Elemento actualizado satisfactoriamente", data });
    }

    async deleteById (req: Request, res: Response, next: NextFunction) {
        const id = await parseId(req.params.id);
        const result = await this.repository.deleteById(id);

        if (!result.success) 
            return next({ statusCode: 500, message: "Ocurrió algo inesperado al eliminar el elemento, intente nuevamente", error: result.error });

        res.status(200).json({ message: "Elemento eliminado correctamente" });
    }
}