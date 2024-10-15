import { INVENTORY_URL } from '@/config';
import prisma from '@/prisma';
import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';

const getProductDetails = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    if (product.inventoryId === null) {
      const { data: inventory } = await axios.post(
        `${INVENTORY_URL}/inventories`,
        {
          productId: product.id,
          sku: product.sku,
        }
      );

      await prisma.product.update({
        where: { id: product.id },
        data: { inventoryId: inventory.id },
      });

      res.status(200).json({
        ...product,
        inventoryId: inventory.id,
        stock: inventory.quantity || 0,
        stockStatus: inventory.quantity > 0 ? 'In Stock' : 'Out of Stock',
      });

      return;
    }

    // fetch inventory
    const { data: inventory } = await axios.get(
      `${INVENTORY_URL}/inventories/${product.inventoryId}`
    );

    res.status(200).json({
      ...product,
      stock: inventory.quantity || 0,
      stockStatus: inventory.quantity > 0 ? 'In Stock' : 'Out of Stock',
    });
  } catch (error) {
    next(error);
  }
};

export default getProductDetails;
