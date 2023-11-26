-- CreateTable
CREATE TABLE "SolveAttempt" (
    "userId" TEXT NOT NULL,
    "problemId" INTEGER NOT NULL,
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "solvedAt" TIMESTAMP(3),
    "numSubmissions" INTEGER NOT NULL DEFAULT 0,
    "gaveUp" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "SolveAttempt_pkey" PRIMARY KEY ("userId","problemId")
);

-- AddForeignKey
ALTER TABLE "SolveAttempt" ADD CONSTRAINT "SolveAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolveAttempt" ADD CONSTRAINT "SolveAttempt_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
