import { describe, expect, it, vi } from 'vitest';
import {
    generateUrlCode,
    getExcludedUrlCodeCharacters,
    hasExcludedUrlCodeCharacters
} from './urlCode';

describe('urlCode', () => {
    describe('getExcludedUrlCodeCharacters', () => {
        it('defaults to excluding underscores and hyphens', () => {
            expect(getExcludedUrlCodeCharacters(undefined)).toEqual(['_', '-']);
        });

        it('normalizes whitespace and duplicate characters', () => {
            expect(getExcludedUrlCodeCharacters(' _ - _ ~ ')).toEqual(['_', '-', '~']);
        });
    });

    describe('hasExcludedUrlCodeCharacters', () => {
        it('detects excluded characters in a generated code', () => {
            expect(hasExcludedUrlCodeCharacters('ab_cd', ['_', '-'])).toBe(true);
            expect(hasExcludedUrlCodeCharacters('ab-cd', ['_', '-'])).toBe(true);
            expect(hasExcludedUrlCodeCharacters('abCd9', ['_', '-'])).toBe(false);
        });
    });

    describe('generateUrlCode', () => {
        it('returns the first generated code without excluded characters', () => {
            const generate = vi.fn()
                .mockReturnValueOnce('bad_code')
                .mockReturnValueOnce('also-bad')
                .mockReturnValueOnce('cleanCode');

            expect(generateUrlCode(generate, ['_', '-'])).toBe('cleanCode');
            expect(generate).toHaveBeenCalledTimes(3);
        });

        it('throws when it cannot generate a clean code within the retry limit', () => {
            const generate = vi.fn(() => 'bad_code');

            expect(() => generateUrlCode(generate, ['_'])).toThrow(
                'Unable to generate a URL code without excluded characters'
            );
            expect(generate).toHaveBeenCalledTimes(25);
        });
    });
});
