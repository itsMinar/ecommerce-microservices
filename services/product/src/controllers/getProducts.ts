import prisma from '@/prisma';
import type { NextFunction, Request, Response } from 'express';

const getProducts = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const products = await prisma.product.findMany({
      select: {
        id: true,
        sku: true,
        name: true,
        price: true,
        inventoryId: true,
      },
    });

    // TODO: Implement pagination
    // TODO: Implement filtering

    res.json({ data: products });
  } catch (error) {
    next(error);
  }
};

export default getProducts;
