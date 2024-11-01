import { CART_TTL, INVENTORY_SERVICE_URL } from '@/config';
import redis from '@/redis';
import { cartItemSchema } from '@/schemas';
import axios from 'axios';
import { NextFunction, Request, Response } from 'express';
import { v4 as uuid } from 'uuid';

const addToCart = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const parsedBody = cartItemSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ errors: parsedBody.error.errors });
      return;
    }

    let cartSessionId = (req.headers['x-cart-session-id'] as string) || null;

    // check if cart session id is present in the request header and exist in the store
    if (cartSessionId) {
      const exists = await redis.exists(`sessions:${cartSessionId}`);
      console.log('🚀 ~ Session exists:', exists);

      if (!exists) {
        cartSessionId = null;
      }
    }

    // if cart session id is not present, create a new one
    if (!cartSessionId) {
      cartSessionId = uuid();
      console.log('🚀 ~ new cartSessionId:', cartSessionId);

      // set the cart session id in the redis store
      await redis.setex(`sessions:${cartSessionId}`, CART_TTL, cartSessionId);

      // set the cart session id in the headers
      res.setHeader('x-cart-session-id', cartSessionId);
    }

    // check if the inventory is available
    const { data } = await axios.get(
      `${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`
    );
    if (Number(data.quantity) < parsedBody.data.quantity) {
      res.status(400).json({ message: 'Inventory not available' });
      return;
    }

    // add item to the cart
    // TODO: check if the product already exists in the cart
    // Logic=> parsedBody.data.quantity - existingQuantity
    await redis.hset(
      `cart:${cartSessionId}`,
      parsedBody.data.productId,
      JSON.stringify({
        inventoryId: parsedBody.data.inventoryId,
        quantity: parsedBody.data.quantity,
      })
    );

    // update inventory
    await axios.put(
      `${INVENTORY_SERVICE_URL}/inventories/${parsedBody.data.inventoryId}`,
      {
        quantity: parsedBody.data.quantity,
        actionType: 'OUT',
      }
    );

    res
      .status(200)
      .json({ message: 'Item added to Cart successfully', cartSessionId });
  } catch (error) {
    next(error);
  }
};

export default addToCart;
