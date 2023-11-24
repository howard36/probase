-- CreateTable
CREATE TABLE "ProblemLike" (
    "userId" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,

    CONSTRAINT "ProblemLike_pkey" PRIMARY KEY ("userId","problemId")
);

-- AddForeignKey
ALTER TABLE "ProblemLike" ADD CONSTRAINT "ProblemLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProblemLike" ADD CONSTRAINT "ProblemLike_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
