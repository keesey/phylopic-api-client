import { Headers } from 'cross-fetch';
import APIError from '../api/APIError';
export interface ContentRangeMetadata {
    readonly range: Readonly<[number, number]>;
    readonly total: number;
}
export const extractContentRange = (headers: Headers) => {
    try {
        const value = headers.get('content-range');
        const match = value!.match(/^\s*items\s+(\*|\d+-\d+)\/(\*|\d+)\s*$/)!;
        const range = match[1];
        const total = parseInt(match[2], 10);
        if (range === '*') {
            return {
                range: [NaN, NaN],
                total,
            } as ContentRangeMetadata;
        }
        const rangeMatch = range.match(/^(\d+)-(\d+)$/)!;
        const start = parseInt(rangeMatch[1], 10);
        const end = parseInt(rangeMatch[2], 10);
        return {
            range: [start, end],
            total,
        } as ContentRangeMetadata;
    } catch (e) {
        throw new APIError(500, [{
            developerMessage: 'Invalid range from API.',
            field: 'Content-Range',
            type: 'DEFAULT_5XX',
            userMessage: 'There was an error in the data response. You may want to report this.',
        }], { ...headers });
    }
};
export default extractContentRange;
