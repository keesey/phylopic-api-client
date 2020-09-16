export interface APIResponse<TData, TMetadata> {
    data: TData;
    metadata: TMetadata;
    status: number;
}
