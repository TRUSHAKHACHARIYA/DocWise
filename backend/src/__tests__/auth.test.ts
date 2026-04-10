import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import request from 'supertest';
import { buildApp } from '../app';
import { prisma } from '../utils/prisma';

const app = buildApp();

describe('Auth Routes Integration', () => {
    beforeAll(async () => {
        await app.ready();
    });

    afterAll(async () => {
        await app.close();
        // In a real test environment, we'd clear the test DB here
    });

    it('should return 200 on root health check', async () => {
        const res = await request(app.server).get('/');
        expect(res.status).toBe(200);
        expect(res.body.message).toContain('DocWise API running');
    });

    it('should return 400 when registering with invalid email', async () => {
        const res = await request(app.server)
            .post('/api/auth/register')
            .send({
                email: 'not-an-email',
                password: 'password123',
                name: 'Test User'
            });
        
        expect(res.status).toBe(400);
        expect(res.body.error).toBe('Validation Error');
    });

    it('should return 401 on login with wrong credentials', async () => {
        const res = await request(app.server)
            .post('/api/auth/login')
            .send({
                email: 'nonexistent@example.com',
                password: 'wrongpassword'
            });
        
        expect(res.status).toBe(401);
        expect(res.body.error).toBe('Invalid credentials');
    });
});
