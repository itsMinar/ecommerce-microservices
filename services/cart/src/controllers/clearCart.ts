import redis from '@/redis';
import { NextFunction, Request, Response } from 'express';

const clearCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const cartSessionId = (req.headers['x-cart-session-id'] as string) || null;
    if (!cartSessionId) {
      res.status(200).json({ message: 'Cart is empty' });
      return;
    }

    // check if the session id exists in the store
    const session = await redis.exists(`sessions:${cartSessionId}`);
    if (!session) {
      delete req.headers['x-cart-session-id'];
      res.status(200).json({ message: 'Cart is empty' });
      return;
    }

    // clear the cart
    await redis.del(`sessions:${cartSessionId}`);
    await redis.del(`cart:${cartSessionId}`);

    delete req.headers['x-cart-session-id'];

    res.status(200).json({ message: 'Cart Cleared Successfully!' });
  } catch (error) {
    next(error);
  }
};

export default clearCart;
