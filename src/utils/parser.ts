export const parseId = async (id: string | Array<string>) => {
    if (typeof id !== 'string') id = id[0];
    return id;
}

export const parseQueryParams = async (query: Record<string, any>) => {
    const parsed: Record<string, any> = {};

    for (const key in query) {
        let value = query[key];

        // 1. Tipado básico (Boilerplate de antes)
        if (value === 'true') value = true;
        else if (value === 'false') value = false;
        else if (!isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '') {
            value = Number(value);
        }

        // 2. Lógica de Operadores (Avanzado)
        if (key.includes('_')) {
            const [field, operator] = key.split('_');
            
            // Mapeo de sufijos a operadores de Prisma
            const prismaOperators: Record<string, string> = {
                gt: 'gt',       // Mayor que
                lt: 'lt',       // Menor que
                gte: 'gte',     // Mayor o igual
                lte: 'lte',     // Menor o igual
                contains: 'contains', // Búsqueda parcial (LIKE %val%)
                not: 'not',     // Diferente de
            };

            if (prismaOperators[operator]) {
                parsed[field] = { ...parsed[field], [prismaOperators[operator]]: value };
                // Si es contains, solemos añadir mode: 'insensitive' para ignorar mayúsculas
                if (operator === 'contains') {
                    parsed[field].mode = 'insensitive';
                }
                continue;
            }
        }

        parsed[key] = value;
    }

    return parsed;
};