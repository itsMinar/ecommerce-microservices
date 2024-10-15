import { EMAIL_SERVICE_URL, USER_SERVICE_URL } from '@/config';
import prisma from '@/prisma';
import { UserCreateSchema } from '@/schemas';
import axios from 'axios';
import bcrypt from 'bcryptjs';
import type { NextFunction, Request, Response } from 'express';

const generateVerificationCode = () => {
  const timestamp = new Date().getTime().toString();

  const randomNum = Math.floor(10 + Math.random() * 90);

  const code = (timestamp + randomNum).slice(-5);

  return code;
};

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

    // generate verification code
    const code = generateVerificationCode();
    await prisma.verificationCode.create({
      data: {
        userId: user.id,
        code,
        expiresAt: new Date(Date.now() + 100 * 60 * 60 * 24), // 24 hours
      },
    });

    // send verification code
    await axios.post(`${EMAIL_SERVICE_URL}/emails/send`, {
      recipient: user.email,
      subject: 'Email Verification',
      body: `Your verification code is ${code}`,
      source: 'user-registration',
    });

    res.status(201).json({
      message: 'User created, check your email for verification code',
      user,
    });
  } catch (error) {
    next(error);
  }
};

export default userRegistration;
