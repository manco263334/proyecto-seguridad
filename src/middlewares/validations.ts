import type { Request, Response, NextFunction } from "express";
import type { Repository, Role, Validator } from "../types/types.d.ts";
import { parseId } from "../utils/parser.ts";

interface ValidateExistenceByFieldParams<ExcludedValuesType> {
    fieldName: string
    shouldExists: boolean
    excludedValues?: Array<ExcludedValuesType>
    limit?: number
}

type ValidatePermissionsParams = {
    acceptedPermissions: "*" | Array<"*" | Role>
} & ({
    matchId?: false
} | {
    matchId: true
    excludedPermissionsFromMatchId?: Array<Role>
})

export default class ValidationMiddlewares<RepositoryType, Output> {
    private validator: Validator<Output>;
    private repository: Repository<RepositoryType>;

    constructor (validator: Validator<Output>, repository: Repository<RepositoryType>) {
        this.validator = validator;
        this.repository = repository;
    }

    validateData = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const result = await this.validator(req.body);

        if (!result.success)
            return next({ statusCode: 400, error: JSON.parse(result.error.message) });

        req.body = result.data;
        next();
    }

    validateExistenceByID = async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
        const id = parseId(req.params.id);

        if (!id) 
            return next({ statusCode: 400, message: 'No se especificó un ID', error: 'Se requiere especificar un ID' });

        const response = await this.repository.getById(id);

        if (!response.success)
            return next({ statusCode: 500, message: 'Ocurrió un error al consultar la existencia, lamentamos las molestias', error: response.error });

        const { data: element } = response;

        if (element === null || element === undefined)
            return next({ statusCode: 404, message: 'No se encontró ningún elemento con el ID especificado' });

        next();
    }

    validateExistenceByField = <ExcludedValuesType = unknown>({ fieldName, shouldExists, excludedValues, limit = 1 }: ValidateExistenceByFieldParams<ExcludedValuesType>) =>
        async (req: Request, _res: Response, next: NextFunction) => {
            const fieldFinder = req.body[fieldName];

            if (!fieldFinder)
                return next({ statusCode: 400, message: `No se encontró ningún campo llamado "${fieldName}" en el cuerpo de la petición` });

            if (!excludedValues?.includes(fieldFinder)) {
                const result = await this.repository.getByField({ fieldName, fieldFinder, limit });

                if (!result.success)
                    return next({ statusCode: 500, message: "Ocurrió un error al consultar la existencia, lamentamos las inconvenientes", error: result.error });

                const { data } = result;

                if (shouldExists && data.length === 0) {
                    return next({ statusCode: 400, message: "No se encontró ningún elemento que coincida con el campo especificado" });
                } else if (shouldExists && data.length > limit) {
                    return next({ statusCode: 400, message: "Ya existen varios elementos que cumplen con esta condición" });
                } else if (!shouldExists && data.length > 0) {
                    return next({ statusCode: 400, message: "Ya existe un elemento que cumple con esta condición" });
                }
            }

            next();
        }

    validatePermissions = (params: ValidatePermissionsParams) => async (req: Request, _res: Response, next: NextFunction) => {
        const user = req.session?.user;

        if (!user)
            return next({ statusCode: 401, message: "Usuario no autenticado, inicie sesión primero" });

        const { acceptedPermissions, matchId } = params;
        const acceptAll = acceptedPermissions.length === 1 && acceptedPermissions[0].trim() === "*";

        if (matchId) {
            const { excludedPermissionsFromMatchId } = params;
            const isExcluded = excludedPermissionsFromMatchId?.includes(user.permissions);
            const id = parseId(req.params.id);

            if (!isExcluded && id !== user.id){
                return next({ statusCode: 403, message: "Lo sentimos, no cuentas con los permisos necesarios para realizar esta acción" });
            }
        } else {
            if (!acceptAll && !acceptedPermissions.includes(user.permissions)) {
                return next({ statusCode: 403, message: "Lo sentimos, no cuentas con los permisos necesarios para realizar esta acción" });
            }
        }

        next();
    }
}