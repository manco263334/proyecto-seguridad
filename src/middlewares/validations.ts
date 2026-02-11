import type { Request, Response, NextFunction } from "express";
import type { Repository, Validator } from "../types/types.d.ts";
import { expressIdToPrismaId } from "../utils/parser.ts";

interface validateExistenceByFieldParams {
    fieldName: string
    shouldExists: boolean
    excludedValues?: Array<any>
    limit?: number
}

export default class ValidationMiddlewares<Input, Output, RepositoryType> {
    private validator: Validator<Input, Output>;
    private repository: Repository<RepositoryType>;

    constructor (validator: Validator<Input, Output>, repository: Repository<RepositoryType>) {
        this.validator = validator;
        this.repository = repository;
    }

    validateData = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const result = await this.validator(req.body);

        if (!result.success) {
            res.status(400).json({ error: JSON.parse(result.error.message) });
            return;
        }

        req.body = result.data;
        next();
    }

    validateExistenceByID = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        const id = expressIdToPrismaId(req.params.id);

        if (!id) {
            res.status(400).json({ message: "No se especificó un ID", error: 'Se requiere especificar un ID' });
            return;
        }

        const response = await this.repository.getById(id);

        if (!response.success) {
            res.status(500).json({ message: "Ocurrió un error al consultar la existencia, lamentamos las molestias", error: response.error });
            return;
        }

        const { data: element } = response;

        if (element === null || element === undefined) {
            res.status(400).json({ message: "No se encontró ningún elemento con el ID especificado" });
            return;
        }

        next();
    }

    validateExistenceByField = ({ fieldName, shouldExists, excludedValues, limit = 1 }: validateExistenceByFieldParams) => {
        return async (req: Request, res: Response, next: NextFunction) => {
            const fieldFinder = req.body[fieldName];

            if (!fieldFinder) {
                res.status(400).json({ message: `No se encontró ningún campo llamado "${fieldName}" en el cuerpo de la petición` });
                return;
            }

            if (!excludedValues?.includes(fieldFinder)) {
                const result = await this.repository.getByField({ fieldName, fieldFinder, limit });

                if (!result.success) {
                    res.status(500).json({ message: "Ocurrió un error al consultar la existencia, lamentamos las inconvenientes", error: result.error });
                    return;
                }

                const { data } = result;

                if (shouldExists && data.length === 0) {
                    res.status(400).json({ message: "No se encontró ningún elemento que coincida con el campo especificado" });
                    return;
                } else if (shouldExists && data.length > limit) {
                    res.status(400).json({ message: "Ya existen varios elementos que cumplen con esta condición" });
                    return;
                } else if (!shouldExists && data.length > 0) {
                    res.status(400).json({ message: "Ya existe un elemento que cumple con esta condición" });
                    return;
                }
            }

            next();
        }
    }
}