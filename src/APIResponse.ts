export interface APIResponse<T> {
    data: T;
    headers: Headers;
    status: number;
}
