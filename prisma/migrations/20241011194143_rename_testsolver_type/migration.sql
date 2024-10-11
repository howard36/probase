/*
  Warnings:

  - You are about to drop the column `testsolveLock` on the `Permission` table. All the data in the column will be lost.
  - You are about to drop the column `testsolveLockStartedAt` on the `Permission` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "TestsolverType" AS ENUM ('Serious', 'Casual');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AlterTable
ALTER TABLE "Permission" DROP COLUMN "testsolveLock",
DROP COLUMN "testsolveLockStartedAt",
ADD COLUMN     "seriousTestsolverStartedAt" TIMESTAMP(3),
ADD COLUMN     "testsolverType" "TestsolverType";
