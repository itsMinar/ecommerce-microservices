import prisma from '@/prisma';
import { User } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';

// /users/:id?field=id|authUserId
const getUserById = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { id } = req.params;
    const field = req.query.field as string;
    let user: User | null = null;

    if (field === 'authUserId') {
      user = await prisma.user.findUnique({ where: { authUserId: id } });
    } else {
      user = await prisma.user.findUnique({ where: { id } });
    }

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
  } catch (error) {
    next(error);
  }
};

export default getUserById;
