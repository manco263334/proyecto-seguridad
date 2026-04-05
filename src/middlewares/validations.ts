import type { Request, Response, NextFunction } from 'express';
import type { Repository, UserRole, Validator } from '../types/types.d.ts';
import { parseId } from '../utils/parser.ts';
import container from '../utils/container.ts';

const { LoggerClass } = container;

interface CallNextMiddleware {
    callNext?: boolean
}

type ValidateDataParams = CallNextMiddleware

type ValidateExistenceByFieldParams<ExcludedValuesType> = CallNextMiddleware & {
    fieldName: string
    shouldExists: boolean
    excludedValues?: Array<ExcludedValuesType>
    limit?: number
}

type ValidatePermissionsParams = CallNextMiddleware & {
    acceptedPermissions: '*' | Array<'*' | UserRole>
} & ({
    matchId?: false
} | {
    matchId: true
    excludedPermissionsFromMatchId?: Array<UserRole>
})

type ValidateExistenceByIdParams = CallNextMiddleware & ({
    getIdFromParams: true
} | {
    getIdFromParams?: false
    idName: string
})

export default class ValidationMiddlewares<RepositoryType, Output> {
    protected validator: Validator<Output>;
    protected repository: Repository<RepositoryType>;

    constructor (validator: Validator<Output>, repository: Repository<RepositoryType>) {
        this.validator = validator;
        this.repository = repository;

        this.validateData = this.validateData.bind(this);
        this.validateExistenceById = this.validateExistenceById.bind(this);
        this.validateExistenceByField = this.validateExistenceByField.bind(this);
        this.validatePermissions = this.validatePermissions.bind(this);
    }

    validateData ({ callNext = true }: ValidateDataParams = {}) {
        return async (req: Request, _res: Response, next: NextFunction): Promise<void> =>  {
            const result = await this.validator(req.body);

            if (!result.success)
                return next({ statusCode: 400, error: JSON.parse(result.error.message) });

            req.body = result.data;

            if (callNext)
                next();
        }
    } 

    validateExistenceById ({ callNext = true, ...options }: ValidateExistenceByIdParams = { getIdFromParams: true }) {
        return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
            const id = await parseId(options.getIdFromParams ? req.params.id : req.body[options.idName]);

            if (!id) 
                return next({ statusCode: 400, message: 'No se especificó un ID', error: 'Se requiere especificar un ID' });
    
            const response = await this.repository.getById(id);
    
            if (!response.success)
                return next({ statusCode: 500, message: 'Ocurrió un error al consultar la existencia, lamentamos las molestias', error: response.error });

            const { data: element } = response;

            if (element === null || element === undefined)
                return next({ statusCode: 404, message: `No se encontró ningún elemento con el ID especificado ${options.getIdFromParams ? 'a través de los parámetros:' : `a través del body: ${options.idName} =`} ${id}` });

            if (callNext)
                next();
        }
    }

    validateExistenceByField <ExcludedValuesType = unknown> ({ fieldName, shouldExists, excludedValues, limit = 1, callNext = true }: ValidateExistenceByFieldParams<ExcludedValuesType>){ 
        return async (req: Request, _res: Response, next: NextFunction) => {
            const fieldFinder = req.body[fieldName];
    
            if (!fieldFinder)
                return next({ statusCode: 400, message: `No se encontró ningún campo llamado '${fieldName}' en el cuerpo de la petición` });
    
            if (!excludedValues?.includes(fieldFinder)) {
                const result = await this.repository.getByField({ fieldName, fieldFinder, limit });
    
                if (!result.success)
                    return next({ statusCode: 500, message: 'Ocurrió un error al consultar la existencia, lamentamos las inconvenientes', error: result.error });
    
                const { data } = result;
    
                const message = `'${fieldName}' = '${fieldFinder}'`;

                if (shouldExists && !data) {
                    return next({ statusCode: 400, message: `No se encontró ningún elemento que coincida con el campo especificado: ${message}` });
                } else if (shouldExists && Array.isArray(data) && data.length > limit) {
                    return next({ statusCode: 400, message: `Ya existen varios elementos que cumplen con esta condición: ${message}` });
                } else if (!shouldExists && data) {
                    return next({ statusCode: 400, message: `Ya existe un elemento que cumple con esta condición: ${message}` });
                }
            }

            if (callNext)
                next();
        }
    } 

    validatePermissions ({ callNext = true, ...options }: ValidatePermissionsParams){
        return async (req: Request, _res: Response, next: NextFunction) => {
            LoggerClass.logger.info('Se detectó el ingreso de un usuario en el middleware para validar permisos');

            const user = req.session?.user;
            LoggerClass.logger.debug(`Usuario detectado: ${user}`);
    
            if (!user){
                LoggerClass.logger.warn('No se detectó un usuario, devolviendo error 401');

                return next({ statusCode: 401, message: 'Usuario no autenticado, inicie sesión primero' });
            }
    
            const { acceptedPermissions } = options;
            const acceptAll = acceptedPermissions.length === 1 && acceptedPermissions[0].trim() === '*';
    
            if (!acceptAll && !acceptedPermissions.includes(user.permissions)) {
                LoggerClass.logger.warn('Se detectó a un usuario pero no cuenta con los requisitos, devolviendo error 403');

                return next({ statusCode: 403, message: 'Lo sentimos, no cuentas con los permisos necesarios para realizar esta acción' });
            }
    
            const { matchId } = options;
    
            if (matchId) {
                const { excludedPermissionsFromMatchId } = options;
                const id = await parseId(req.params.id);
                const isExcluded = excludedPermissionsFromMatchId?.includes(user.permissions);
                
                if (!isExcluded && user.id !== id)
                    return next({ statusCode: 403, message: 'Lo sentimos, no cuentas con los permisos necesarios para realizar esta acción' });
            }
    
            if (callNext)
                next();
        }
    } 
}