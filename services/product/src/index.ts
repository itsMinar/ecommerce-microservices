import cors from 'cors';
import dotenv from 'dotenv';
import express, { type Application } from 'express';
import morgan from 'morgan';
import {
  createProduct,
  getProductDetails,
  getProducts,
  updateProduct,
} from './controllers';

dotenv.config();

const app: Application = express();

app.use(express.json());
app.use(cors());
app.use(morgan('dev'));

// health check
app.get('/health', (_req, res) => {
  res.status(200).json({ status: 'UP' });
});

// restrict origin
// app.use((req, res, next) => {
//   const allowedOrigins = ['http://localhost:8081', 'http://127.0.0.1:8081'];
//   const origin = req.headers.origin || '';

//   if (allowedOrigins.includes(origin)) {
//     res.setHeader('Access-Control-Allow-Origin', origin);
//     next();
//   } else {
//     res.status(403).json({ message: 'Forbidden - You can not access this' });
//   }
// });

// routes
app.get('/products/:id', getProductDetails);
app.put('/products/:id', updateProduct);
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
const SERVICE_NAME = process.env.SERVICE_NAME || 'Product-Service';

app.listen(PORT, () => {
  console.log(`${SERVICE_NAME} is running on port ${PORT}`);
});
