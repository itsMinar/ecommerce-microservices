import { defaultSender, transporter } from '@/config';
import prisma from '@/prisma';
import { EmailCreateSchema } from '@/schemas';
import type { NextFunction, Request, Response } from 'express';

const sendEmail = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // validate the request body
    const parsedBody = EmailCreateSchema.safeParse(req.body);
    if (!parsedBody.success) {
      res.status(400).json({ message: parsedBody.error.errors });
      return;
    }

    // create mail option
    const { sender, recipient, body, source, subject } = parsedBody.data;
    const from = sender || defaultSender;

    const emailOption = {
      from,
      to: recipient,
      subject,
      text: body,
    };

    // send the mail
    const { rejected } = await transporter.sendMail(emailOption);
    if (rejected.length) {
      console.log('🚀 ~ rejected:', rejected);
      res.status(500).json({ message: 'Failed' });
      return;
    }

    await prisma.email.create({
      data: {
        sender: from,
        recipient,
        subject,
        body,
        source,
      },
    });

    res.status(200).json({ message: 'Email sent' });
  } catch (error) {
    next(error);
  }
};

export default sendEmail;
