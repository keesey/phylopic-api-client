import { expect } from 'chai';
import { describe, it } from 'mocha';
import { Headers, HeadersInit } from 'node-fetch';
import extractContentRange, { ContentRangeMetadata } from './extractContentRange';
describe('metadata/extractContentRange', () => {
    const itShouldWorkFor = (name: string, headersInit: HeadersInit, expected: ContentRangeMetadata) => {
        it(`should work for ${name}`, () => {
            const actual = extractContentRange(new Headers(headersInit));
            expect(actual).to.deep.equal(expected);
        });
    };
    const itShouldThrowFor = (name: string, headersInit: Readonly<Record<string, string>>) => {
        it(`should throw an error for ${name}`, () => {
            const headers = new Headers(headersInit);
            expect(() => extractContentRange(headers)).to.throw('Invalid range from API.');
        });
    };
    itShouldThrowFor('a missing Content-Range header', {});
    itShouldThrowFor('a malformed Content-Range header', { 'content-range': 'foo' });
    itShouldThrowFor('a Content-Range header with the wrong unit', { 'content-range': 'things 0-9/10' });
    itShouldWorkFor(
        'a simple Content-Range header',
        { 'content-range': 'items 0-9/10' },
        {
            range: [0, 9],
            total: 10,
        },
    );
    itShouldWorkFor(
        'a simple Content-Range header with capitalized header name',
        { 'Content-Range': 'items 0-9/10' },
        {
            range: [0, 9],
            total: 10,
        },
    );
    itShouldWorkFor(
        'a simple Content-Range header with extra whitespace',
        { 'content-range': '    items    0-9/10\t' },
        {
            range: [0, 9],
            total: 10,
        },
    );
    itShouldWorkFor(
        'a Content-Range header with no size',
        { 'content-range': 'items 0-9/*' },
        {
            range: [0, 9],
            total: NaN,
        },
    );
    itShouldWorkFor(
        'a Content-Range header with no item range',
        { 'content-range': 'items */10' },
        {
            range: [NaN, NaN],
            total: 10,
        },
    );
    itShouldWorkFor(
        'a Content-Range header with no item range or size',
        { 'content-range': 'items */*' },
        {
            range: [NaN, NaN],
            total: NaN,
        },
    );
});
