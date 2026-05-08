import { beforeEach, describe, expect, it, vi } from 'vitest';

const modelMock = vi.hoisted(() => ({
    findOne: vi.fn()
}));

vi.mock('../models/DiminutoUrlModel', () => ({
    default: modelMock
}));

import { redirectToLongUrl } from './redirect';

function createResponseMock() {
    const res = {
        statusCode: 200,
        text: '',
        redirectedTo: '',
        status: vi.fn(function(this: typeof res, code: number) {
            this.statusCode = code;
            return this;
        }),
        send: vi.fn(function(this: typeof res, payload: string) {
            this.text = payload;
            return this;
        }),
        redirect: vi.fn(function(this: typeof res, location: string) {
            this.statusCode = 302;
            this.redirectedTo = location;
            return this;
        })
    };

    return res;
}

describe('redirectToLongUrl', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for invalid short code format', async () => {
        const req = {
            params: { code: 'bad.code' }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.text).toBe('Invalid short code');
        expect(modelMock.findOne).not.toHaveBeenCalled();
    });

    it('uses the first short code when params contain an array', async () => {
        modelMock.findOne.mockResolvedValue(null);
        const req = {
            params: { code: ['abc123', 'ignored'] }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(modelMock.findOne).toHaveBeenCalledWith({ urlCode: 'abc123' });
        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.text).toBe('URL not found');
    });

    it('redirects when code exists', async () => {
        modelMock.findOne.mockResolvedValue({
            longUrl: 'https://example.com/landing'
        });
        const req = {
            params: { code: 'abc123' }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(res.redirect).toHaveBeenCalledWith('https://example.com/landing');
        expect(res.redirectedTo).toBe('https://example.com/landing');
    });

    it('returns 400 when stored redirect url is unsafe', async () => {
        modelMock.findOne.mockResolvedValue({
            longUrl: 'http://127.0.0.1:8080/private'
        });
        const req = {
            params: { code: 'abc123' }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.text).toBe('Unsafe redirect url');
    });

    it('returns 404 when code does not exist', async () => {
        modelMock.findOne.mockResolvedValue(null);
        const req = {
            params: { code: 'abc123' }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(404);
        expect(res.text).toBe('URL not found');
    });

    it('returns 500 when model throws', async () => {
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => undefined);
        modelMock.findOne.mockRejectedValue(new Error('query failed'));
        const req = {
            params: { code: 'abc123' }
        };
        const res = createResponseMock();

        await redirectToLongUrl(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.text).toBe('Internal Server Error');
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
