import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const modelMock = vi.hoisted(() => ({
    findOne: vi.fn(),
    create: vi.fn()
}));

vi.mock('../models/DiminutoUrlModel', () => ({
    default: modelMock
}));

import { diminutoRouter } from './diminuto';

describe('diminuto route', () => {
    const app = express();
    app.use(express.json());
    app.use(diminutoRouter);

    beforeEach(() => {
        vi.clearAllMocks();
        process.env.DNS_URI = 'https://diminuto.example.com';
    });

    it('returns 400 when long url is invalid', async () => {
        const response = await request(app)
            .post('/api/diminuto')
            .send({ longUrl: 'notaurl' });

        expect(response.status).toBe(400);
        expect(response.body.message).toContain('Invalid long Url');
    });

    it('returns existing url when present', async () => {
        const existing = {
            longUrl: 'https://example.com/page',
            shortUrl: 'https://diminuto.example.com/abc123',
            urlCode: 'abc123'
        };
        modelMock.findOne.mockResolvedValue(existing);

        const response = await request(app)
            .post('/api/diminuto')
            .send({ longUrl: 'https://example.com/page' });

        expect(response.status).toBe(200);
        expect(response.body.urlCode).toBe('abc123');
        expect(modelMock.create).not.toHaveBeenCalled();
    });

    it('creates and returns a new short url when no existing match', async () => {
        modelMock.findOne.mockResolvedValue(null);
        modelMock.create.mockResolvedValue({
            longUrl: 'https://example.com/new',
            shortUrl: 'https://diminuto.example.com/newCode',
            urlCode: 'newCode'
        });

        const response = await request(app)
            .post('/api/diminuto')
            .send({ longUrl: 'https://example.com/new' });

        expect(response.status).toBe(200);
        expect(modelMock.create).toHaveBeenCalledTimes(1);
        expect(response.body.shortUrl).toContain('https://diminuto.example.com/');
    });

    it('returns 500 on unexpected model error', async () => {
        modelMock.findOne.mockRejectedValue(new Error('db down'));

        const response = await request(app)
            .post('/api/diminuto')
            .send({ longUrl: 'https://example.com/will-fail' });

        expect(response.status).toBe(500);
        expect(response.body.message).toBe('Server error');
    });
});
