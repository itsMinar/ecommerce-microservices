import prisma from '@/prisma';
import { ProductUpdateDTOSchema } from '@/schemas';
import type { NextFunction, Request, Response } from 'express';

const updateProduct = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const { id } = req.params;

    const parsedBody = ProductUpdateDTOSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({
        message: 'Invalid request body',
        errors: parsedBody.error.errors,
      });
      return;
    }

    // check if the product exists
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      res.status(404).json({ message: 'Product not found' });
      return;
    }

    // update the product
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: parsedBody.data,
    });

    res.status(200).json({ data: updatedProduct });
  } catch (error) {
    next(error);
  }
};

export default updateProduct;
