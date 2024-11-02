import dotenv from 'dotenv';
dotenv.config({
  path: '.env',
});

export const PRODUCT_SERVICE =
  process.env.PRODUCT_SERVICE_URL || 'http://localhost:4001';
export const CART_SERVICE =
  process.env.CART_SERVICE_URL || 'http://localhost:4006';
export const EMAIL_SERVICE =
  process.env.EMAIL_SERVICE_URL || 'http://localhost:4005';
