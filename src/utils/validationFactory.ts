import type { ZodObject } from "zod"
import type { Repository, SchemaPartialParser } from "../types/types.d.ts"
import VM from "../middlewares/validations.ts"

interface ValidationFactoryProps<RepositoryType, Output> {
    isPartial: boolean
    schema: SchemaPartialParser<Output> | ZodObject
    repository: Repository<RepositoryType>
}

export function validationFactory<RepositoryType, Output = unknown>({ isPartial, schema, repository }: ValidationFactoryProps<RepositoryType, Output>) {
    const schemaValidator = typeof schema === 'function' ? schema({ isPartial }) : 
        isPartial ? schema.partial().safeParseAsync : schema.safeParseAsync;

    return new VM<RepositoryType, Output>(schemaValidator, repository);
}