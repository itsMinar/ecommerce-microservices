import { INVENTORY_URL } from '@/config';
import prisma from '@/prisma';
import { ProductCreateDTOSchema } from '@/schemas';
import axios from 'axios';
import type { NextFunction, Request, Response } from 'express';

const createProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedBody = ProductCreateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.errors,
      });
      return;
    }

    // check if product with the same sku already exists
    const existingProduct = await prisma.product.findFirst({
      where: { sku: parsedBody.data?.sku },
    });
    if (existingProduct) {
      res
        .status(400)
        .json({ message: 'Product with the same SKU already exists' });
      return;
    }

    // create product
    const product = await prisma.product.create({
      data: parsedBody.data,
    });

    // create inventory record for the product
    const { data: inventory } = await axios.post(
      `${INVENTORY_URL}/inventories`,
      {
        productId: product.id,
        sku: product.sku,
      }
    );

    // update product and store inventory id
    await prisma.product.update({
      where: { id: product.id },
      data: { inventoryId: inventory.id },
    });

    res.status(201).json({ ...product, inventoryId: inventory.id });
  } catch (error) {
    next(error);
  }
};

export default createProduct;
