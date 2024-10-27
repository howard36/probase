-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Invite_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Permission" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "Permission_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "TestProblem" ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "TestProblem_pkey" PRIMARY KEY ("id");
