import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import express from 'express';
import {
    validateRegistration,
    validateLogin,
    validatePasswordChange
} from '../../validators/authValidators.js';
import {
    validateCreateOrder,
    validateUpdateOrderStatus,
    validateGetOrders
} from '../../validators/orderValidators.js';

const app = express();
app.use(express.json());

describe('Auth Validators', () => {
    describe('validateRegistration', () => {
        beforeEach(() => {
            app.post('/test-register', validateRegistration, (req, res) => {
                res.json({ success: true });
            });
        });

        it('should pass with valid registration data', async () => {
            const validData = {
                username: 'testuser123',
                email: 'test@example.com',
                password: 'Password123',
                full_name: 'Test User',
                phone: '+1234567890'
            };

            const response = await request(app)
                .post('/test-register')
                .send(validData);

            expect(response.status).toBe(200);
        });

        it('should fail with invalid username', async () => {
            const invalidData = {
                username: 'ab', // Too short
                email: 'test@example.com',
                password: 'Password123',
                full_name: 'Test User'
            };

            const response = await request(app)
                .post('/test-register')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with invalid email', async () => {
            const invalidData = {
                username: 'testuser123',
                email: 'invalid-email',
                password: 'Password123',
                full_name: 'Test User'
            };

            const response = await request(app)
                .post('/test-register')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with weak password', async () => {
            const invalidData = {
                username: 'testuser123',
                email: 'test@example.com',
                password: 'weak', // Too weak
                full_name: 'Test User'
            };

            const response = await request(app)
                .post('/test-register')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('validateLogin', () => {
        beforeEach(() => {
            app.post('/test-login', validateLogin, (req, res) => {
                res.json({ success: true });
            });
        });

        it('should pass with valid login data', async () => {
            const validData = {
                username: 'testuser',
                password: 'password123'
            };

            const response = await request(app)
                .post('/test-login')
                .send(validData);

            expect(response.status).toBe(200);
        });

        it('should fail with missing username', async () => {
            const invalidData = {
                password: 'password123'
            };

            const response = await request(app)
                .post('/test-login')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with missing password', async () => {
            const invalidData = {
                username: 'testuser'
            };

            const response = await request(app)
                .post('/test-login')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });
});

describe('Order Validators', () => {
    describe('validateCreateOrder', () => {
        beforeEach(() => {
            app.post('/test-create-order', validateCreateOrder, (req, res) => {
                res.json({ success: true });
            });
        });

        it('should pass with valid order data', async () => {
            const validData = {
                store_id: 1,
                order_date: '2024-01-15',
                delivery_date: '2024-01-20',
                total_amount: 100.50,
                discount_amount: 10.00,
                notes: 'Test order',
                items: [
                    {
                        product_id: 1,
                        quantity: 2,
                        unit_price: 50.25
                    }
                ]
            };

            const response = await request(app)
                .post('/test-create-order')
                .send(validData);

            expect(response.status).toBe(200);
        });

        it('should fail with invalid store_id', async () => {
            const invalidData = {
                store_id: 'invalid', // Should be number
                items: [
                    {
                        product_id: 1,
                        quantity: 2,
                        unit_price: 50.25
                    }
                ]
            };

            const response = await request(app)
                .post('/test-create-order')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with delivery date before order date', async () => {
            const invalidData = {
                store_id: 1,
                order_date: '2024-01-20',
                delivery_date: '2024-01-15', // Before order date
                items: [
                    {
                        product_id: 1,
                        quantity: 2,
                        unit_price: 50.25
                    }
                ]
            };

            const response = await request(app)
                .post('/test-create-order')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with invalid item data', async () => {
            const invalidData = {
                store_id: 1,
                items: [
                    {
                        product_id: 'invalid', // Should be number
                        quantity: 0, // Should be positive
                        unit_price: -10 // Should be positive
                    }
                ]
            };

            const response = await request(app)
                .post('/test-create-order')
                .send(invalidData);

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });

    describe('validateGetOrders', () => {
        beforeEach(() => {
            app.get('/test-get-orders', validateGetOrders, (req, res) => {
                res.json({ success: true });
            });
        });

        it('should pass with valid query parameters', async () => {
            const response = await request(app)
                .get('/test-get-orders')
                .query({
                    page: 1,
                    limit: 10,
                    status: 'draft',
                    payment_status: 'pending',
                    store_id: 1,
                    date_from: '2024-01-01',
                    date_to: '2024-01-31'
                });

            expect(response.status).toBe(200);
        });

        it('should fail with invalid page number', async () => {
            const response = await request(app)
                .get('/test-get-orders')
                .query({
                    page: 0 // Should be positive
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with invalid limit', async () => {
            const response = await request(app)
                .get('/test-get-orders')
                .query({
                    limit: 150 // Should be max 100
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });

        it('should fail with invalid status', async () => {
            const response = await request(app)
                .get('/test-get-orders')
                .query({
                    status: 'invalid_status'
                });

            expect(response.status).toBe(400);
            expect(response.body.errors).toBeDefined();
        });
    });
}); 