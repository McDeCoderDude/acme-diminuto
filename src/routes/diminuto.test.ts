import { beforeEach, describe, expect, it, vi } from 'vitest';

const modelMock = vi.hoisted(() => ({
    findOne: vi.fn(),
    create: vi.fn()
}));

const shortidMock = vi.hoisted(() => ({
    generate: vi.fn(() => 'fixedCode')
}));

vi.mock('../models/DiminutoUrlModel', () => ({
    default: modelMock
}));

vi.mock('shortid', () => ({
    default: shortidMock
}));

import { createDiminuto } from './diminuto';

function createResponseMock() {
    const res = {
        statusCode: 200,
        body: undefined as unknown,
        status: vi.fn(function(this: typeof res, code: number) {
            this.statusCode = code;
            return this;
        }),
        json: vi.fn(function(this: typeof res, payload: unknown) {
            this.body = payload;
            return this;
        })
    };

    return res;
}

describe('createDiminuto', () => {
    beforeEach(() => {
        vi.clearAllMocks();
        process.env.DNS_URI = 'https://diminuto.example.com';
        process.env.URL_CODE_EXCLUDED_CHARS = '_-';
    });

    it('returns 400 when the configured base url is invalid', async () => {
        process.env.DNS_URI = 'http://localhost:3000';
        const req = {
            body: { longUrl: 'https://example.com/page' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: 'Invalid base url' });
        expect(modelMock.findOne).not.toHaveBeenCalled();
    });

    it('returns 400 when long url is invalid', async () => {
        const req = {
            body: { longUrl: 'notaurl' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(400);
        expect(res.body).toEqual({ message: 'Invalid long Url' });
    });

    it('returns existing url when present', async () => {
        const existing = {
            longUrl: 'https://example.com/page',
            shortUrl: 'https://diminuto.example.com/abc123',
            urlCode: 'abc123'
        };
        modelMock.findOne.mockResolvedValue(existing);
        const req = {
            body: { longUrl: 'https://example.com/page' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(modelMock.findOne).toHaveBeenCalledWith({
            longUrl: { $eq: 'https://example.com/page' }
        });
        expect(res.status).not.toHaveBeenCalled();
        expect(res.body).toEqual(existing);
        expect(modelMock.create).not.toHaveBeenCalled();
    });

    it('creates and returns a new short url when no existing match', async () => {
        const created = {
            longUrl: 'https://example.com/new',
            shortUrl: 'https://diminuto.example.com/fixedCode',
            urlCode: 'fixedCode'
        };
        modelMock.findOne.mockResolvedValue(null);
        modelMock.create.mockResolvedValue(created);
        const req = {
            body: { longUrl: 'https://example.com/new' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(shortidMock.generate).toHaveBeenCalledTimes(1);
        expect(modelMock.create).toHaveBeenCalledWith(created);
        expect(res.body).toEqual(created);
    });

    it('returns 500 on unexpected model error', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        modelMock.findOne.mockRejectedValue(new Error('db down'));
        const req = {
            body: { longUrl: 'https://example.com/will-fail' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: 'Server error' });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('returns 500 when a clean short code cannot be generated', async () => {
        const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => undefined);
        shortidMock.generate.mockReturnValue('_bad-code_');
        const req = {
            body: { longUrl: 'https://example.com/will-fail' }
        };
        const res = createResponseMock();

        await createDiminuto(req as never, res as never);

        expect(res.status).toHaveBeenCalledWith(500);
        expect(res.body).toEqual({ message: 'Server error' });
        expect(shortidMock.generate).toHaveBeenCalledTimes(25);
        expect(modelMock.findOne).not.toHaveBeenCalled();
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });
});
