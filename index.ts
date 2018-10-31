import Types from 'phylopic-api-types';
import APIError from './src/APIError';
export type Fetch = typeof fetch;
const CONTENT_TYPE = 'application/vnd.phylopic.v2+json';
const createRangeInit = (options: RangeOptions) => {
    return {
        headers: new Headers({
            Accept: CONTENT_TYPE,
            Range: `items=${options.range.join('-')}`,
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
interface RangeOptions {
    readonly range: Readonly<[number, number]>;
}
interface SetOptions extends RangeOptions {
    readonly created?: Readonly<[Date | null, Date | null]>;
    readonly embed?: ReadonlySet<string>;
    readonly modified?: Readonly<[Date | null, Date | null]>;
    readonly sort?: ReadonlyArray<string>;
}
export interface ImageSetOptions extends SetOptions {
    readonly embed?: ReadonlySet<ImageEmbedField>;
    readonly licenseComponents?: ReadonlySet<LicenseComponent>;
    readonly sort?: ReadonlyArray<ImageSortField>;
}
export interface SearchOptions extends RangeOptions {
    readonly query: string;
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
    public authorize(token: string) {
        this.authorization = token;
    }
    public deauthorize() {
        this.authorization = null;
    }
    public async deleteImage(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
            }),
            method: 'DELETE',
        };
        await this.makeCall(`images/${uuid}`, init);
    }
    public async deleteNode(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
            }),
            method: 'DELETE',
        };
        await this.makeCall(`nodes/${uuid}`, init);
    }
    public async getAccount(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`account/${uuid}`, init);
        return await response.json() as Types.Account;
    }
    public async getImage(uuid: string, options?: { embed?: ReadonlySet<ImageEmbedField> }) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`images/${uuid}${formatQuery(query)}`, init);
        return await response.json() as Types.Image;
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
        const init: RequestInit = {
            headers: new Headers({
                Accept: variant ? 'image/png' : 'image/svg+xml; image.png',
            }),
            method: 'GET',
        };
        const response = await this.makeCall(path, init);
        if (response.headers.get('Content-Type') === 'image/svg+xml') {
            return response.text();
        }
        return response.blob();
    }
    public async getImageSet(uuid: string, options: ImageSetOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = createSetQuery(options);
        if (options.licenseComponents && options.licenseComponents.size) {
            query.licensecomponents = setToArray(options.licenseComponents).join(' ');
        }
        const url = `imagesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as Types.List<Types.Image>;
    }
    public async getImages() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('images', init);
        return await response.json() as Types.Domain;
    }
    public async getLicenses() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('licenses', init);
        return await response.json() as ReadonlyArray<Types.TitledLink>;
    }
    public async getNode(uuid: string, options?: { embed?: ReadonlySet<NodeEmbedField> }) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`nodes/${uuid}${formatQuery(query)}`, init);
        return await response.json() as Types.Node;
    }
    public async getNodeSet(uuid: string, options: NodeSetOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = createSetQuery(options);
        const url = `nodesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as Types.List<Types.Node>;
    }
    public async getNodes() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('nodes', init);
        return await response.json() as Types.Domain;
    }
    public async getRoot() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('', init);
        return await response.json() as Types.Root;
    }
    public async patchImage(uuid: string, patch: Types.ImagePatch) {
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'PATCH',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async patchNode(uuid: string, patch: Types.NodePatch) {
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
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
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async postImageFile(file: File) {
        const init: RequestInit = {
            body: await readBlob(file),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
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
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('imagesets', init);
        return await response.json() as Types.EntityReference;
    }
    public async postNode(post: Types.NodePost) {
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
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
                Accept: CONTENT_TYPE,
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('nodesets', init);
        return await response.json() as Types.EntityReference;
    }
    public async postNodeWithUUID(uuid: string, post: Types.NodePost) {
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
                'Content-Type': CONTENT_TYPE,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`nodes/${uuid}`, init);
        return await response.json() as Types.Node;
    }
    public async putImageFile(uuid: string, file: File) {
        const init: RequestInit = {
            body: await readBlob(file),
            headers: new Headers({
                Accept: CONTENT_TYPE,
                Authorization: this.authorization || '',
                'Content-Type': file.type,
            }),
            method: 'PUT',
        }
        const response = await this.makeCall(`imagefiles/${uuid}`, init);
        return await response.json() as Types.Image;
    }
    public async resolve(uri: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: CONTENT_TYPE,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`resolve/${uri}`, init);
        if (response.status === 307) {
            const response2 = await this.makeCall(this.baseURL.replace(/\/$/, '') + response.headers.get('Location'));
            return [await response2.json() as Types.Node];
        }
        const choices = await response.json() as Types.NodeChoices;
        return choices._embedded.choices;
    }
    public async searchNodes(options: SearchOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = { query: options.query };
        const url = `search/nodes${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as Types.NodeSearch;
    }
    private authorization: string | null = null;
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
        throw new APIError(response.status, [{
            developerMessage: response.statusText,
            type: response.status < 500 ? 'DEFAULT_4XX' : 'DEFAULT_5XX',
            userMessage: 'An unexpected error occurred.'
        }]);
    }
}
