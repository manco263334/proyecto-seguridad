export const parseId = async (id: string | Array<string>) => {
    if (typeof id !== 'string') id = id[0];
    return Number(id);
}

export const parseQueryParams = async (query: Record<string, any>) => {
    const parsed: Record<string, any> = {};

    for (const key in query) {
        const value = query[key];

        if (value === 'true') parsed[key] = true;
        else if (value === 'false') parsed[key] = false;
        else if (!isNaN(Number(value)) && typeof value === 'string' && value.trim() !== '') {
            parsed[key] = Number(value);
        } else {
            parsed[key] = value;
        }
    }
    return parsed;
};