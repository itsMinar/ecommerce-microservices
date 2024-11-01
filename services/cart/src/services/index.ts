import { INVENTORY_SERVICE_URL } from '@/config';
import redis from '@/redis';
import axios from 'axios';

export const clearCart = async (id: string) => {
  try {
    const data = await redis.hgetall(`cart:${id}`);
    if (Object.keys(data).length === 0) return;

    const items = Object.keys(data).map((key) => {
      const { quantity, inventoryId } = JSON.parse(data[key]) as {
        inventoryId: string;
        quantity: number;
      };

      return {
        productId: key,
        inventoryId,
        quantity,
      };
    });

    // update the inventory
    const request = items.map(async (item) => {
      return axios.put(
        `${INVENTORY_SERVICE_URL}/inventories/${item.inventoryId}`,
        {
          quantity: item.quantity,
          actionType: 'IN',
        }
      );
    });

    Promise.all(request);
    console.log('inventory updated');

    // clear the cart
    await redis.del(`cart:${id}`);
  } catch (error) {
    console.log('🚀 ~ clearCart ~ error:', error);
  }
};
