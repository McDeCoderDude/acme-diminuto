import { describe, expect, it } from 'vitest';
import { isSafeHttpUrl, isSafeShortCode } from './urlValidation';

describe('urlValidation', () => {
    describe('isSafeShortCode', () => {
        it('accepts a valid code', () => {
            expect(isSafeShortCode('abcD_123')).toBe(true);
        });

        it('rejects code with invalid characters', () => {
            expect(isSafeShortCode('bad/code')).toBe(false);
        });

        it('rejects code shorter than required length', () => {
            expect(isSafeShortCode('abc')).toBe(false);
        });
    });

    describe('isSafeHttpUrl', () => {
        it('accepts valid public https urls', () => {
            expect(isSafeHttpUrl('https://example.com/some/path')).toBe(true);
        });

        it('accepts valid public http urls', () => {
            expect(isSafeHttpUrl('http://example.com')).toBe(true);
        });

        it('rejects non-http schemes', () => {
            expect(isSafeHttpUrl('ftp://example.com')).toBe(false);
        });

        it('rejects localhost urls', () => {
            expect(isSafeHttpUrl('http://localhost:3000')).toBe(false);
        });

        it('rejects private ipv4 urls', () => {
            expect(isSafeHttpUrl('http://192.168.1.10/path')).toBe(false);
        });

        it('rejects loopback and link-local ranges', () => {
            expect(isSafeHttpUrl('http://127.0.0.1:8080')).toBe(false);
            expect(isSafeHttpUrl('http://169.254.10.5')).toBe(false);
        });

        it('rejects 10.x and 172.16/12 ranges', () => {
            expect(isSafeHttpUrl('http://10.10.10.10')).toBe(false);
            expect(isSafeHttpUrl('http://172.16.0.1')).toBe(false);
            expect(isSafeHttpUrl('http://172.31.255.255')).toBe(false);
        });

        it('rejects .local hostnames', () => {
            expect(isSafeHttpUrl('https://printer.local')).toBe(false);
        });

        it('rejects overly long urls', () => {
            const longUrl = `https://example.com/${'a'.repeat(2100)}`;
            expect(isSafeHttpUrl(longUrl)).toBe(false);
        });

        it('rejects invalid urls', () => {
            expect(isSafeHttpUrl('not-a-url')).toBe(false);
        });
    });
});
