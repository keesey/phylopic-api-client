import { expect } from 'chai';
import { describe, it } from 'mocha';
import formatQuery from './formatQuery';
describe('queries/formatQuery', () => {
    const itShouldWorkFor = (name: string, query: Record<string, any> | undefined, expected: string) => {
        it(`should work for ${name}`, () => {
            const actual = formatQuery(query);
            expect(actual).to.equal(expected);
        });
    };
    itShouldWorkFor('undefined', undefined, '');
    itShouldWorkFor('an empty record', {}, '');
    itShouldWorkFor(
        'a populated record',
        {
            string: 'This is a string, isn\'t it?',
            boolean: true,
            number: 1.234,
        },
        '?boolean=true&number=1.234&string=This+is+a+string%2C+isn\'t+it%3F',
    );
});
