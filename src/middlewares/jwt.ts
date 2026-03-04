import type { Request, Response, NextFunction } from "express";
import type { Repository, User, Role } from "../types/types.d.ts";
import { verifyToken } from "../utils/jwt.ts";
import { AUTH_TOKEN_NAME as AUTH_TOKEN } from "../constants/api.ts";

type ValidatePermissionsResponse = {
    code: number
} & ({
    success?: false
    error: string
} | {
    success: true
})

export default class JWTMiddlewares {
    private repository: Repository<User>;

    constructor (repository: Repository<User>) {
        this.repository = repository;

        this.validatePermissions = this.validatePermissions.bind(this);
    }

    getUserData = async (req: Request, _res: Response, next: NextFunction) => {
        const token = req.cookies?.[AUTH_TOKEN] as string | undefined;
        req.session = { user: undefined };

        if (token) {
            try {
                const payload = await verifyToken(token) as { id: number, permissions: Role };

                const result = await this.validatePermissions(payload.id, payload.permissions);
                const { code, success } = result;

                if (!success)
                    return next({ statusCode: code, message: result.error });

                req.session.user = payload;
            } catch (error) {
                return next({ statusCode: 401, message: 'Token inválido o expirado' });
            }
        }

        next();
    }

    async validatePermissions (id: number, permissions: Role): Promise<ValidatePermissionsResponse> {
        const response = await this.repository.getById(id);

        if (!response.success) return { code: 500, error: 'Ocurrió un error inesperado, intente nuevamente' };

        const user = response.data;

        if (!user) return { code: 404, error: 'Usuario no encontrado' };

        if (user.role !== permissions) return { code: 401, error: 'Token inválido o expirado' };

        return { code: 200, success: true };
    }
}