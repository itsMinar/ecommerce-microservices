import { USER_SERVICE_URL } from '@/config';
import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';

const userRegistration = async (
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
    const existingUser = await prisma.user.findUnique({
      where: { email: parsedBody.data.email },
    });
    if (existingUser) {
      res.status(400).json({ message: 'User already exists' });
      return;
    }

    // hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(parsedBody.data.password, salt);

    // create the auth user
    const user = await prisma.user.create({
      data: {
        ...parsedBody.data,
        password: hashedPassword,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        status: true,
        verified: true,
      },
    });
    console.log('🚀 ~ user created:', user.id);

    // create the user profile by calling the user service
    await axios.post(`${USER_SERVICE_URL}/users`, {
      authUserId: user.id,
      name: user.name,
      email: user.email,
    });

    // TODO: generate verification code
    // TODO: send verification code

    res.status(201).json(user);
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
