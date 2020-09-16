import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import fetchMock from 'fetch-mock';
import { describe } from 'mocha';
import APIClient from './APIClient';
import { APIClientOptions } from './APIClientOptions';
chai.use(chaiAsPromised);
const JWT = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c';
describe('api/APIClient', () => {
    afterEach(() => fetchMock.restore());
    const testWithOptions = (name: string, options?: APIClientOptions) => {
        describe(name, () => {
            describe('.deleteImage()', async () => {
                if (!options?.apiKey && !options?.jwt) {
                    expect(() => new APIClient(options).deleteImage('7f3532e2-43f7-400f-9df6-0176ea8d160a', '1')).to.be.rejected('');
                } else {
                    fetchMock
                        .deleteOnce('https://api.phylopic.org/images/7f3532e2-43f7-400f-9df6-0176ea8d160a', 204)
                        .mock('*', 404);
                    const response = await new APIClient(options).deleteImage('7f3532e2-43f7-400f-9df6-0176ea8d160a', '1');
                    expect(response).to.deep.equal({
                        data: null,
                        metadata: {},
                        status: 204,
                    });
                }
            });
        });
    };
    testWithOptions('with default options');
    testWithOptions('with API Key authentication', { apiKey: '12345' });
    testWithOptions('with JWT authentication', { jwt: JWT });
});
