import Types from 'phylopic-api-types';
import APIError from './src/APIError';
export type Fetch = typeof fetch;
const CONTENT_TYPE = 'application/vnd.phylopic.v2+json';
const createBasicInit: (method?: string) => RequestInit = (method = 'GET') => ({
    headers: new Headers({
        'Accept': CONTENT_TYPE,
    }),
    method,
});
const createSetInit = (options: SetOptions) => {
    return {
        headers: new Headers({
            Accept: CONTENT_TYPE,
            Range: `items=${options.range[0]}-${options.range[1]}`,
        }),
        method: 'GET',
    } as RequestInit;
};
const createSetQuery = (options: SetOptions) => {
    const query: { [key: string]: string; } = {};
    if (options.created) {
        if (options.created[0]) {
            query.created_gt = options.created[0].toISOString();
        }
        if (options.created[1]) {
            query.created_lt = options.created[1].toISOString();
        }
    }
    if (options.embed && options.embed.size) {
        query.embed = setToArray(options.embed).join(' ');
    }
    if (options.modified) {
        if (options.modified[0]) {
            query.modified_gt = options.modified[0].toISOString();
        }
        if (options.modified[1]) {
            query.modified_lt = options.modified[1].toISOString();
        }
    }
    if (options.sort && options.sort.length) {
        query.sort = options.sort.join(' ');
    }
    return query;
};
const formatQuery = (query: { [key: string]: string; }) => {
    const keys = Object.keys(query);
    return keys.length
        ? `?${keys.map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(query[key])}`).join('&')}`
        : '';
};
const readBlob = async (blob: Blob) => new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onabort = reject;
    reader.onerror = reject;
    reader.onloadend = () => resolve(reader.result as string);
    reader.readAsBinaryString(blob);
});
const setToArray = <T>(s: ReadonlySet<T>) => {
    const a: T[] = [];
    for (const value of s) {
        a.push(value);
    }
    return a.sort() as ReadonlyArray<T>;
};
export interface ImageFileOptions {
    readonly download?: boolean;
    readonly variant?: ImageFileVariant;
}
interface SetOptions {
    readonly created?: Readonly<[Date | null, Date | null]>,
    readonly embed?: ReadonlySet<string>;
    readonly modified?: Readonly<[Date | null, Date | null]>,
    readonly range: Readonly<[number, number]>,
    readonly sort?: ReadonlyArray<string>,
}
export interface ImageSetOptions extends SetOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
    readonly licenseComponents?: ReadonlySet<LicenseComponent>;
    readonly sort?: ReadonlyArray<ImageSortField>,
}
export type ImageEmbedField = 'contributor' | 'generalNode' | 'nodes' | 'specificNode';
export type ImageSortField = 'created' | 'modified' | '-created' | '-modified';
export type ImageFileVariant = 'basic32'
    | 'basic64'
    | 'basic128'
    | 'basic256'
    | 'basic512'
    | 'basic1024'
    | 'social1200x630'
    | 'social440x220'
    | 'square32'
    | 'square64'
    | 'square128'
    | 'square256'
    | 'square512'
    | 'square1024';
export type LicenseComponent = 'by' | 'nc' | 'sa' | '-by' | '-nc' | '-sa';
export type NodeEmbedField = 'childNodes' | 'contributor' | 'parentNode' | 'primaryImage';
export interface NodeSetOptions extends SetOptions {
    readonly embed?: ReadonlySet<NodeEmbedField>;
    readonly sort?: ReadonlyArray<NodeSortField>,
}
export type NodeSortField = 'created' | 'modified' | 'names' | '-created' | '-modified' | '-names';
export default class PhyloPicAPIClient {
    constructor(private fetch: Fetch, private baseURL = 'https://api.phylopic.org/') {
    }
    public async deleteImage(uuid: string) {
        // :TODO: add authentication
        await this.makeCall(`images/${uuid}`, createBasicInit('DELETE'));
    }
    public async deleteNode(uuid: string) {
        // :TODO: add authentication
        await this.makeCall(`nodes/${uuid}`, createBasicInit('DELETE'));
    }
    public async getAccount(uuid: string) {
        const response = await this.makeCall(`account/${uuid}`, createBasicInit());
        return await response.json() as Types.Account;
    }
    public async getImageFile(uuid: string, options: ImageFileOptions = {}) {
        const { download, variant } = options;
        const query = [
            download ? 'download' : null,
            variant ? `variant=${encodeURIComponent(variant)}` : null,
        ]
            .filter(Boolean)
            .join('&');
        const path = `imagefiles/${uuid}${query ? `?${query}` : ''}`
        const response = await this.makeCall(path, {
            headers: new Headers({
                'Accept': variant ? 'image/png' : 'image/svg+xml; image.png',
            }),
            method: 'GET',
        });
        if (response.headers.get('Content-Type') === 'image/svg+xml') {
            return response.text();
        }
        return response.blob();
    }
    public async getImage(uuid: string, options?: { embed?: ReadonlySet<ImageEmbedField> }) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const response = await this.makeCall(`images/${uuid}${formatQuery(query)}`, createBasicInit());
        return await response.json() as Types.Image;
    }
    public async getImageSet(uuid: string, options: ImageSetOptions) {
        const init: RequestInit = createSetInit(options)
        const query = createSetQuery(options);
        if (options.licenseComponents && options.licenseComponents.size) {
            query.licensecomponents = setToArray(options.licenseComponents).join(' ');
        }
        const url = `imagesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as Types.List<Types.Image>;
    }
    public async getImages() {
        const response = await this.makeCall('images', createBasicInit());
        return await response.json() as Types.Domain;
    }
    public async getLicenses() {
        const response = await this.makeCall('licenses', createBasicInit());
        return await response.json() as ReadonlyArray<Types.TitledLink>;
    }
    public async getNode(uuid: string, options?: { embed?: ReadonlySet<NodeEmbedField> }) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const response = await this.makeCall(`nodes/${uuid}${formatQuery(query)}`, createBasicInit());
        return await response.json() as Types.Node;
    }
    public async getNodeSet(uuid: string, options: NodeSetOptions) {
        const init: RequestInit = createSetInit(options)
        const query = createSetQuery(options);
        const url = `nodesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as Types.List<Types.Node>;
    }
    public async getNodes() {
        const response = await this.makeCall('nodes', createBasicInit());
        return await response.json() as Types.Domain;
    }
    public async getRoot() {
        const response = await this.makeCall('', createBasicInit());
        return await response.json() as Types.Root;
    }
    public async patchImage(uuid: string, patch: Types.ImagePatch) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'PATCH',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async patchNode(uuid: string, patch: Types.NodePatch) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'PATCH',
        };
        const response = await this.makeCall(`nodes/${uuid}`, init);
        return await response.json() as Types.Node;
    }
    public async ping() {
        await this.makeCall('ping');
    }
    public async postImage(uuid: string, post: Types.ImagePost) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async postImageFile(file: File) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: await readBlob(file),
            headers: new Headers({
                'Accept': CONTENT_TYPE,
                'Content-Type': file.type,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('imagefiles', init);
        return await response.json() as Types.Image;
    }
    public async postImageSet(uuids: string[]) {
        const init: RequestInit = {
            body: JSON.stringify({ uuids }),
            headers: new Headers({
                'Accept': CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('imagesets', init);
        return await response.json() as Types.EntityReference;
    }
    public async postNode(post: Types.NodePost) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        };
        const response = await this.makeCall('nodes', init);
        return await response.json() as Types.Node;
    }
    public async postNodeSet(uuids: string[]) {
        const init: RequestInit = {
            body: JSON.stringify({ uuids }),
            headers: new Headers({
                'Accept': CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('nodesets', init);
        return await response.json() as Types.EntityReference;
    }
    public async postNodeWithUUID(uuid: string, post: Types.NodePost) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`nodes/${uuid}`, init);
        return await response.json() as Types.Node;
    }
    public async putImageFile(uuid: string, file: File) {
        // :TODO: add authentication
        const init: RequestInit = {
            body: await readBlob(file),
            headers: new Headers({
                'Accept': CONTENT_TYPE,
                'Content-Type': file.type,
            }),
            method: 'PUT',
        }
        const response = await this.makeCall(`imagefiles/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async resolve(uri: string) {
        const response = await this.makeCall(`resolve/${uri}`, createBasicInit());
        if (response.status === 307) {
            const response2 = await this.makeCall(this.baseURL.replace(/\/$/, '') + response.headers.get('Location'));
            return [await response2.json() as Types.Node];
        }
        const choices = await response.json() as Types.NodeChoices;
        return choices._embedded.choices;
    }
    private async makeCall(path: string, init?: RequestInit) {
        const response = await this.fetch(`${this.baseURL}${path}`, init);
        if (response.ok) {
            return response;
        }
        if (response.headers.get('content-type') === CONTENT_TYPE) {
            const errors: ReadonlyArray<Types.Error> = await response.json();
            if (errors && errors.length) {
                throw new APIError(response.status, errors);
            }
        }
        throw new APIError(response.status, []);
    }
}
