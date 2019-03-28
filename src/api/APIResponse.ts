export interface APIResponse<D, M> {
    data: D;
    metadata: M;
    status: number;
}
