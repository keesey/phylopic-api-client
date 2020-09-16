import { Headers, Response } from 'cross-fetch';
import { APIResponse } from './APIResponse';
const statusHasBody = (status: number) => {
    return status !== 204 && status !== 304;
};
export const createAPIResponse = async <TData, TMetadata>(response: Response, extractMetadata: (headers: Headers) => TMetadata) => {
    const data = statusHasBody(response.status) ? (await response.json()) as TData : null;
    return {
        data,
        metadata: extractMetadata(response.headers),
        status: response.status,
    } as APIResponse<TData, TMetadata>;
};
export default createAPIResponse;
