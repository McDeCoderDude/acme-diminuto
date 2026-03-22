import express from 'express';
import request from 'supertest';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const modelMock = vi.hoisted(() => ({
    findOne: vi.fn()
}));

vi.mock('../models/DiminutoUrlModel', () => ({
    default: modelMock
}));

import { redirectRouter } from './redirect';

describe('redirect route', () => {
    const app = express();
    app.use(redirectRouter);

    beforeEach(() => {
        vi.clearAllMocks();
    });

    it('returns 400 for invalid short code format', async () => {
        const response = await request(app).get('/bad/code');
        expect(response.status).toBe(404);
    });

    it('returns 400 for disallowed short code characters', async () => {
        const response = await request(app).get('/bad.code');
        expect(response.status).toBe(400);
        expect(response.text).toContain('Invalid short code');
    });

    it('redirects when code exists', async () => {
        modelMock.findOne.mockResolvedValue({
            longUrl: 'https://example.com/landing'
        });

        const response = await request(app).get('/abc123');
        expect(response.status).toBe(302);
        expect(response.headers.location).toBe('https://example.com/landing');
    });

    it('returns 404 when code does not exist', async () => {
        modelMock.findOne.mockResolvedValue(null);

        const response = await request(app).get('/abc123');
        expect(response.status).toBe(404);
        expect(response.text).toContain('URL not found');
    });

    it('returns 500 when model throws', async () => {
        modelMock.findOne.mockRejectedValue(new Error('query failed'));

        const response = await request(app).get('/abc123');
        expect(response.status).toBe(500);
        expect(response.text).toContain('Internal Server Error');
    });
});
