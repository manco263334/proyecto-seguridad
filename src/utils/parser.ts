export function expressIdToPrismaId(id: string | Array<string>): number {
    if (typeof id !== 'string') id = id[0];
    return Number(id);
}