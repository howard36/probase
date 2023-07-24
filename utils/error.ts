import type { NextResponse } from 'next/server'
import { Prisma } from '@prisma/client'

export function handleApiError(error, res: NextResponse) {
  let message: string;
  if (error instanceof Prisma.PrismaClientKnownRequestError ||
      error instanceof Prisma.PrismaClientUnknownRequestError ||
      error instanceof Prisma.PrismaClientRustPanicError ||
      error instanceof Prisma.PrismaClientInitializationError ||
      error instanceof Prisma.PrismaClientValidationError) {
    message = error.message;
  } else {
    message = String(error);
  }
  res.status(500).json({
    error: {
      message
    }
  });
}
