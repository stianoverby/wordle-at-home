export function range(start: number, end: number, step: number = 1): number[]{
    const result = [];
    for (let i = start; (step > 0) ? i < end : i > end; i += step) {
        result.push(i);
    }
    return result;
}