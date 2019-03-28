import { APIResponse } from './APIResponse';
const statusHasBody = (status: number) => {
    return status !== 204 && status !== 304;
};
export const createAPIResponse = async <D, M>(response: Response, extractMetadata: (headers: Headers) => M) => {
    const data = statusHasBody(response.status) ? (await response.json()) as D : null;
    return {
        data,
        metadata: extractMetadata(response.headers),
        status: response.status,
    } as APIResponse<D, M>;
};
export default createAPIResponse;
