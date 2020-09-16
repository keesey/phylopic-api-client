import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Headers } from 'cross-fetch';
import extractETag, { ETagMetadata } from './extractETag';
describe('metadata/extractETag', () => {
    const itShouldWorkFor = (name: string, headersInit: HeadersInit, expected: ETagMetadata) => {
        it(`should work for ${name}`, () => {
            const actual = extractETag(new Headers(headersInit));
            expect(actual).to.deep.equal(expected);
        });
    };
    itShouldWorkFor('no ETag header', {}, {});
    itShouldWorkFor('an empty ETag header', { etag: '' }, {});
    itShouldWorkFor('a normal ETag header', { etag: 'foo' }, { eTag: 'foo' });
});
