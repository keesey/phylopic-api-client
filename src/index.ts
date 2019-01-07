import {
    DATA,
    Domain,
    EntityReference,
    Error as PhyloPicError,
    IMAGES,
    Image,
    ImagePatch,
    ImagePost,
    ImageSearch,
    List,
    NodeChoices,
    NodePatch,
    NodePost,
    NodeSearch,
    Root,
    TitledLink,
} from 'phylopic-api-types';
import APIError from './APIError';
import { ImageOptions } from './options/ImageOptions';
import { ImageSetOptions } from './options/ImageSetOptions';
import { NodeOptions } from './options/NodeOptions';
import { NodeSetOptions } from './options/NodeSetOptions';
import { SearchOptions } from './options/SearchOptions';
import createRangeInit from './utilities/createRangeInit';
import createSetQuery from './utilities/createSetQuery';
import formatQuery from './utilities/formatQuery';
import readBlob from './utilities/readBlob';
import setToArray from './utilities/setToArray';
export type Fetch = typeof fetch;
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
                Accept: DATA,
                Authorization: this.authorization || '',
            }),
            method: 'DELETE',
        };
        await this.makeCall(`images/${uuid}`, init);
    }
    public async deleteNode(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
            }),
            method: 'DELETE',
        };
        await this.makeCall(`nodes/${uuid}`, init);
    }
    public async deleteSubmission(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
            }),
            method: 'DELETE',
        };
        await this.makeCall(`submissions/${uuid}`, init);
    }
    public async getAccount(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`account/${uuid}`, init);
        return await response.json() as Account;
    }
    public async getImage(uuid: string, options?: ImageOptions) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`images/${uuid}${formatQuery(query)}`, init);
        return await response.json() as Image;
    }
    public async getImageSet(uuid: string, options: ImageSetOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = createSetQuery(options);
        if (options.licenseComponents && options.licenseComponents.size) {
            query.licensecomponents = setToArray(options.licenseComponents).join(' ');
        }
        const url = `imagesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as List<Image>;
    }
    public async getImages() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('images', init);
        return await response.json() as Domain;
    }
    public async getLicenses() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('licenses', init);
        return await response.json() as ReadonlyArray<TitledLink>;
    }
    public async getNode(uuid: string, options?: NodeOptions) {
        const query: { [key: string]: string; } = {};
        if (options && options.embed && options.embed.size) {
            query.embed = setToArray(options.embed).join(' ');
        }
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`nodes/${uuid}${formatQuery(query)}`, init);
        return await response.json() as Node;
    }
    public async getNodeSet(uuid: string, options: NodeSetOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = createSetQuery(options);
        const url = `nodesets/${uuid}${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as List<Node>;
    }
    public async getNodes() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('nodes', init);
        return await response.json() as Domain;
    }
    public async getRoot() {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall('', init);
        return await response.json() as Root;
    }
    public async getSubmission(uuid: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: [...IMAGES].join(', '),
                Authorization: this.authorization || '',
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`submissions/${uuid}`, init);
        if (response.headers.get('Content-Type') === 'image/svg+xml') {
            return response.text();
        }
        return response.blob();
    }
    public async patchImage(uuid: string, patch: ImagePatch) {
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
                'Content-Type': DATA,
            }),
            method: 'PATCH',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Image;
    }
    public async patchNode(uuid: string, patch: NodePatch) {
        const init: RequestInit = {
            body: JSON.stringify(patch),
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
                'Content-Type': DATA,
            }),
            method: 'PATCH',
        };
        const response = await this.makeCall(`nodes/${uuid}`, init);
        return await response.json() as Node;
    }
    public async ping() {
        await this.makeCall('ping');
    }
    public async postImage(uuid: string, post: ImagePost) {
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
                'Content-Type': DATA,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`images/${uuid}`, init);
        return await response.json() as Image;
    }
    public async postImageSet(uuids: string[]) {
        const init: RequestInit = {
            body: JSON.stringify({ uuids }),
            headers: new Headers({
                Accept: DATA,
                'Content-Type': DATA,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('imagesets', init);
        return await response.json() as EntityReference;
    }
    public async postNodeSet(uuids: string[]) {
        const init: RequestInit = {
            body: JSON.stringify({ uuids }),
            headers: new Headers({
                Accept: DATA,
                'Content-Type': DATA,
            }),
            method: 'POST',
        }
        const response = await this.makeCall('nodesets', init);
        return await response.json() as EntityReference;
    }
    public async postNode(uuid: string, post: NodePost) {
        const init: RequestInit = {
            body: JSON.stringify(post),
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
                'Content-Type': DATA,
            }),
            method: 'POST',
        };
        const response = await this.makeCall(`nodes/${uuid}`, init);
        return await response.json() as Node;
    }
    public async putSubmission(uuid: string, file: File) {
        const init: RequestInit = {
            body: await readBlob(file),
            headers: new Headers({
                Accept: DATA,
                Authorization: this.authorization || '',
                'Content-Type': file.type,
            }),
            method: 'PUT',
        }
        const response = await this.makeCall(`submissions/${uuid}`, init);
        return await response.json() as Image;
    }
    public async resolve(uri: string) {
        const init: RequestInit = {
            headers: new Headers({
                Accept: DATA,
            }),
            method: 'GET',
        };
        const response = await this.makeCall(`resolve/${uri}`, init);
        if (response.status === 307) {
            const response2 = await this.makeCall(this.baseURL.replace(/\/$/, '') + response.headers.get('Location'));
            return [await response2.json() as Node];
        }
        const choices = await response.json() as NodeChoices;
        return choices._embedded.choices;
    }
    public async searchImages(options: SearchOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = { query: options.query };
        const url = `search/images${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as ImageSearch;
    }
    public async searchNodes(options: SearchOptions) {
        const init: RequestInit = createRangeInit(options)
        const query = { query: options.query };
        const url = `search/nodes${formatQuery(query)}`
        const response = await this.makeCall(url, init);
        return await response.json() as NodeSearch;
    }
    private authorization: string | null = null;
    private async makeCall(path: string, init?: RequestInit) {
        const response = await this.fetch(`${this.baseURL}${path}`, init);
        if (response.ok) {
            return response;
        }
        if (response.headers.get('content-type') === DATA) {
            const errors: ReadonlyArray<PhyloPicError> = await response.json();
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
