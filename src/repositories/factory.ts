import type { Repository, Error, Success, ReturnType, PrismaDelegate, GetByFieldDelimiters, GetAllDelimiters } from "../types/types.d.ts";
import type { PrismaClient } from "../generated/prisma/client.ts";

class BaseRepository<T> implements Repository<T> {
    protected delegate: PrismaDelegate;

    constructor(delegate: PrismaDelegate) {
        this.delegate = delegate;

        this.create = this.create.bind(this);
        this.getAll = this.getAll.bind(this);
        this.getById = this.getById.bind(this);
        this.getByField = this.getByField.bind(this);
        this.deleteById = this.deleteById.bind(this);
        this.updateById = this.updateById.bind(this);
    }

    async create(data: T): Promise<ReturnType<T>> {
        try {
            const result = await this.delegate.create<T>({ data });
            return { data: result, success: true } as Success<T>;
        } catch (error) {
            return { error } as Error<T>;
        }
    }

    getPage = ({ total, limit, skip }: { total: number; [key: string]: number | undefined }) => {
        if (!limit || !skip) return;
        const min = Math.min(limit * skip, total);
        return Math.ceil(min / limit);
    }

    async getAll(options: GetAllDelimiters = {}): Promise<ReturnType<Array<T>>> {
        try {
            const total = await this.delegate.count({ where: options.where }) as number;
            const skip = this.getPage({ total, take: options.take, skip: options.skip });
            const results = await this.delegate.findMany<T>({
                where: options.where,
                take: options.take,
                skip,
            });
            return { data: results, success: true, total } as Success<Array<T>>;
        } catch (error) {
            return { error } as Error<Array<T>>;
        }
    }

    async getById(id: number): Promise<ReturnType<Nullish<T>>> {
        try {
            const result = await this.delegate.findFirst<T>({ where: { id } });
            return { data: result, success: true } as Success<T>;
        } catch (error) {
            return { error } as Error<T>;
        }
    }

    async getByField({ fieldName, fieldFinder, limit = 10 }: GetByFieldDelimiters): Promise<ReturnType<Array<T> | Nullish<T>>> {
        try {
            const results = await this.delegate.findMany<T>({ 
                where: { [fieldName]: fieldFinder },
                take: limit
            });

            const data = results.length === 0 ? null : limit === 1 ? results[0] : results;

            return { data, success: true } as Success<Array<T> | Nullish<T>>;
        } catch (error) {
            return { error } as Error<Array<T>>;
        }
    }

    async deleteById(id: number): Promise<ReturnType<Nullish<T>>> {
        try {
            await this.delegate.delete<T>({ where: { id } });
            return { success: true } as Success<undefined>;
        } catch (error) {
            return { error } as Error<T>;
        }
    }

    async updateById(id: number, data: PartialOrComplete<T>): Promise<ReturnType<PartialOrComplete<T>>> {
        try {
            const result = await this.delegate.update<T>({ 
                where: { id },
                data
            });
            return { data: result, success: true } as Success<T>;
        } catch (error) {
            return { error } as Error<T>;
        }
    }
}

export default class FactoryRepository {
    private prisma: PrismaClient;

    constructor(prisma: PrismaClient) {
        this.prisma = prisma;
    }

    // Método genérico para obtener cualquier repositorio estándar
    getRepository<T>(modelName: keyof PrismaClient): BaseRepository<T> {
        return new BaseRepository<T>(this.prisma[modelName] as PrismaDelegate);
    }
}