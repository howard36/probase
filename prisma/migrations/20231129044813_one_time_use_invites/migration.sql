-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "expiresAt" TIMESTAMP(3),
ADD COLUMN     "oneTimeUse" BOOLEAN NOT NULL DEFAULT false;
