import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import type { NextFunction, Request, Response } from 'express';

const createUser = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const parsedBody = UserCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ message: parsedBody.error.errors });
      return;
    }

    // check if the authUserId already exists
    const existingUser = await prisma.user.findFirst({
      where: { authUserId: parsedBody.data.authUserId },
    });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // create new user
    const user = await prisma.user.create({
      data: parsedBody.data,
    });

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default createUser;
