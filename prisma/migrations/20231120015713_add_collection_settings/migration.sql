/*
  Warnings:

  - You are about to drop the column `likes` on the `Problem` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "AnswerFormat" AS ENUM ('Proof', 'ShortAnswer', 'Integer');

-- AlterTable
ALTER TABLE "Collection" ADD COLUMN     "answerFormat" "AnswerFormat" NOT NULL DEFAULT 'ShortAnswer',
ADD COLUMN     "requireAnswer" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requireDifficulty" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requireSolution" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "requireTestsolve" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "Problem" DROP COLUMN "likes",
ALTER COLUMN "difficulty" DROP NOT NULL;
