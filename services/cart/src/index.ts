import cors from 'cors';
import dotenv from 'dotenv';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import morgan from 'morgan';
import { addToCart, clearCart, getMyCart } from './controllers';
import './events/onKeyExpires';

dotenv.config();

const app = express();

// security middleware
app.use(helmet());

// rate limiting middleware
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100,
  handler: (req, res) => {
    res
      .status(429)
      .json({ message: 'Too many request, please try again later' });
  },
});
app.use('/api', limiter);

// request logger middleware
app.use(morgan('dev'));

// others middleware
app.use(express.json());
app.use(cors());

// TODO: Auth middleware

// health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

// routes
app.post('/cart/add-to-cart', addToCart);
app.get('/cart/me', getMyCart);
app.get('/cart/clear', clearCart);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 4006;
const SERVICE_NAME = process.env.SERVICE_NAME || 'Cart-Service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
