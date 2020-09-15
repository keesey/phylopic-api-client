import { expect } from 'chai';
import { describe, it } from 'mocha';
import createListQuery from './createListQuery';
import { ListOptions } from '../options/ListOptions';
describe('queries/createListQuery', () => {
    const toDate = (iso: string) => new Date(Date.parse(iso));
    const itShouldWorkFor = (name: string, options: ListOptions, expected: Record<string, string>) => {
        it(`should work for ${name}`, () => {
            const actual = createListQuery(options);
            expect(actual).to.deep.equal(expected);
        });
    };
    itShouldWorkFor('a simple range', { range: [0, 1] }, {});
    itShouldWorkFor(
        'a range of creation dates',
        {
            created: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            range: [0, 1],
        },
        {
            created_gt: '2020-01-01T00:00:00.000Z',
            created_lt: '2020-11-10T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a minimum creation date',
        {
            created: [toDate('2020-01-01T00:00:00.000Z'), null],
            range: [0, 1],
        },
        {
            created_gt: '2020-01-01T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a maximum creation date',
        {
            created: [null, toDate('2020-11-10T00:00:00.000Z')],
            range: [0, 1],
        },
        {
            created_lt: '2020-11-10T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a range of modification dates',
        {
            modified: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            range: [0, 1],
        },
        {
            modified_gt: '2020-01-01T00:00:00.000Z',
            modified_lt: '2020-11-10T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a minimum modification date',
        {
            modified: [toDate('2020-01-01T00:00:00.000Z'), null],
            range: [0, 1],
        },
        {
            modified_gt: '2020-01-01T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a maximum modification date',
        {
            modified: [null, toDate('2020-11-10T00:00:00.000Z')],
            range: [0, 1],
        },
        {
            modified_lt: '2020-11-10T00:00:00.000Z',
        },
    );
    itShouldWorkFor(
        'a set of embeds',
        {
            embed: new Set(['a', 'c', 'b']),
            range: [0, 1],
        },
        {
            embed: 'a b c',
        },
    );
    itShouldWorkFor(
        'a list of sort fields',
        {
            sort: ['b', 'a'],
            range: [0, 1],
        },
        {
            sort: 'b a',
        },
    );
    itShouldWorkFor(
        'all options together',
        {
            created: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            embed: new Set(['a', 'c', 'b']),
            modified: [toDate('2020-01-01T00:00:00.000Z'), toDate('2020-11-10T00:00:00.000Z')],
            sort: ['b', 'a'],
            range: [0, 1],
        },
        {
            created_gt: '2020-01-01T00:00:00.000Z',
            created_lt: '2020-11-10T00:00:00.000Z',
            embed: 'a b c',
            modified_gt: '2020-01-01T00:00:00.000Z',
            modified_lt: '2020-11-10T00:00:00.000Z',
            sort: 'b a',
        },
    );
});
