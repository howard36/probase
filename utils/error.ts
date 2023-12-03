import type { NextApiResponse } from "next";
import { Prisma } from "@prisma/client";

export function handleApiError(error: unknown, res: NextApiResponse) {
  console.error({ error });

  let message: string;
  if (
    error instanceof Prisma.PrismaClientKnownRequestError ||
    error instanceof Prisma.PrismaClientUnknownRequestError ||
    error instanceof Prisma.PrismaClientRustPanicError ||
    error instanceof Prisma.PrismaClientInitializationError ||
    error instanceof Prisma.PrismaClientValidationError
  ) {
    message = error.message;
  } else {
    message = String(error);
  }

  res.status(500).json({
    error: {
      message,
    },
  });
}
