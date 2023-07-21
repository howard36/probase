/*
  Warnings:

  - A unique constraint covering the columns `[collectionId,pid]` on the table `Problem` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateEnum
CREATE TYPE "AccessLevel" AS ENUM ('Normal', 'Admin');

-- DropIndex
DROP INDEX "Problem_pid_key";

-- AlterTable
ALTER TABLE "Problem" ALTER COLUMN "likes" SET DEFAULT 0;

-- CreateTable
CREATE TABLE "Permission" (
    "userId" TEXT NOT NULL,
    "collectionId" INTEGER NOT NULL,
    "accessLevel" "AccessLevel" NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "Permission_userId_collectionId_key" ON "Permission"("userId", "collectionId");

-- CreateIndex
CREATE UNIQUE INDEX "Problem_collectionId_pid_key" ON "Problem"("collectionId", "pid");

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Permission" ADD CONSTRAINT "Permission_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
