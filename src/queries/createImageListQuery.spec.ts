import { expect } from 'chai';
import { describe, it } from 'mocha';
import { ImageListOptions, LicenseComponentSpecification } from '../options/ImageListOptions';
import createImageListQuery from './createImageListQuery';
describe('queries/createImageListQuery', () => {
    const toDate = (iso: string) => new Date(Date.parse(iso));
    const itShouldWorkFor = (name: string, options: ImageListOptions, expected: Record<string, string>) => {
        it(`should work for ${name}`, () => {
            const actual = createImageListQuery(options);
            expect(actual).to.deep.equal(expected);
        });
    };
    itShouldWorkFor('a simple range', { range: [0, 1] }, { });
    itShouldWorkFor(
        'a set of license components',
        {
            licenseComponents: new Set<LicenseComponentSpecification>(['by', '-nc', '-sa']),
            range: [0, 1],
        },
        {
            licensecomponents: '-nc -sa by',
        },
    );
    itShouldWorkFor(
        'all options together',
        {
            created: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            embed: new Set(['generalNode', 'contributor']),
            licenseComponents: new Set<LicenseComponentSpecification>(['by', '-nc', '-sa']),
            modified: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            sort: ['created', '-modified'],
            range: [0, 1],
        },
        {
            created_gt: '2020-01-01T00:00:00.000Z',
            created_lt: '2020-11-10T00:00:00.000Z',
            embed: 'contributor generalNode',
            licensecomponents: '-nc -sa by',
            modified_gt: '2020-01-01T00:00:00.000Z',
            modified_lt: '2020-11-10T00:00:00.000Z',
            sort: 'created -modified',
        },
    );
});
