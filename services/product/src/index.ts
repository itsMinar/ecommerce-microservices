import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Application } from 'express';
import morgan from 'morgan';
import { createProduct, getProductDetails, getProducts } from './controllers';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

// routes
app.get('/products/:id', getProductDetails);
app.get('/products', getProducts);
app.post('/products', createProduct);

// 404 handler
app.use((_req, res) => {
  res.status(404).json({ message: 'Not Found' });
});

// error handler
app.use((err, _req, res, _next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Internal server error' });
});

const PORT = process.env.PORT || 4001;
const SERVICE_NAME = process.env.SERVICE_NAME || 'product-service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});