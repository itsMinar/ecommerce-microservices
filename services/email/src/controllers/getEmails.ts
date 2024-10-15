import prisma from '@/prisma';
import type { NextFunction, Request, Response } from 'express';

const getEmails = async (
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const emails = await prisma.email.findMany();

    res.json(emails);
  } catch (error) {
    next(error);
  }
};

export default getEmails;
