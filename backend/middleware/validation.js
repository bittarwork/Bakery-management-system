import { validationResult } from 'express-validator';
import logger from '../config/logger.js';

/**
 * Middleware to handle validation errors from express-validator
 */
export const validateRequest = (req, res, next) => {
    const errors = validationResult(req);
    
    if (!errors.isEmpty()) {
        const errorMessages = errors.array().map(error => ({
            field: error.path || error.param,
            message: error.msg,
            value: error.value
        }));

        logger.warn('Validation failed:', {
            url: req.originalUrl,
            method: req.method,
            errors: errorMessages,
            body: req.body,
            params: req.params,
            query: req.query
        });

        return res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errorMessages
        });
    }
    
    next();
};

/**
 * Middleware to sanitize input data
 */
export const sanitizeInput = (req, res, next) => {
    // Remove any potentially dangerous properties
    const dangerousProps = ['__proto__', 'constructor', 'prototype'];
    
    const sanitizeObject = (obj) => {
        if (obj && typeof obj === 'object') {
            for (const prop of dangerousProps) {
                if (obj.hasOwnProperty(prop)) {
                    delete obj[prop];
                }
            }
            
            // Recursively sanitize nested objects
            for (const key in obj) {
                if (obj.hasOwnProperty(key) && typeof obj[key] === 'object') {
                    sanitizeObject(obj[key]);
                }
            }
        }
    };
    
    sanitizeObject(req.body);
    sanitizeObject(req.query);
    sanitizeObject(req.params);
    
    next();
};

export default {
    validateRequest,
    sanitizeInput
}; 