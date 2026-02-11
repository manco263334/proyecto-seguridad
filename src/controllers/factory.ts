import type { Request, Response } from "express";
import type { Controller, Repository } from "../types/types.d.ts";
import { expressIdToPrismaId } from "../utils/parser.ts";

export default class FactoryController<T> implements Controller<T> {
    protected repository: Repository<T>;

    constructor (repository: Repository<T>) {
        this.repository = repository;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.updateById = this.updateById.bind(this);
        this.deleteById = this.deleteById.bind(this);
    }

    async create (req: Request<unknown, any, T>, res: Response) {
        const data = req.body;
        const result = await this.repository.create(data);

        if (!result.success) {
            res.status(500).json({ message: "Ocurrió un error al crear el elemento, lamentamos las molestias", error: result.error });
        } else {
            res.status(201).json({ message: "Elemento creado correctamente", data: result.data });
        }
    }

    async getAll (_req: Request, res: Response) {
        const result = await this.repository.getAll();

        if (!result.success) {
            res.status(500).json({ message: "Ocurrió un error al consultar los elementos, lamentamos los inconvenientes", error: result.error });
        } else {
            res.status(200).json({ message: "Elementos recuperados de la base de datos", data: result.data });
        }
    }

    async getById (req: Request, res: Response) {
        const id = expressIdToPrismaId(req.params.id);
        const result = await this.repository.getById(id);

        if (!result.success) {
            res.status(500).json({ message: "Ocurrió un error al consultar el elemento, lamentamos lo sucedido", error: result.error });
        } else {
            res.status(200).json({ message: "Elemento recuperado de la base de datos", data: result.data });
        }
    }

    async updateById (req: Request<any, any, PartialOrComplete<T>>, res: Response) {
        const id = expressIdToPrismaId(req.params.id);
        const data = req.body;

        const result = await this.repository.updateById(id, data);

        if (!result.success) {
            res.status(500).json({ message: "Ocurrió algo inesperado mientras se actualizaba el elemento, lamentamos lo sucedido", error: result.error });
        } else {
            res.status(200).json({ message: "Elemento actualizado satisfactoriamente", data: result.data });
        }
    }

    async deleteById (req: Request, res: Response) {
        const id = expressIdToPrismaId(req.params.id);
        const result = await this.repository.deleteById(id);

        if (!result.success) {
            res.status(500).json({ message: "Ocurrió algo inesperado al eliminar el elemento, intente nuevamente", error: result.error });
        } else {
            res.status(200).json({ message: "Elemento eliminado correctamente" });
        }
    }
}