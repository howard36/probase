-- CreateTable
CREATE TABLE "Test" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "collectionId" INTEGER NOT NULL,

    CONSTRAINT "Test_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TestProblem" (
    "testId" INTEGER NOT NULL,
    "problemId" INTEGER NOT NULL,
    "position" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "TestProblem_testId_problemId_key" ON "TestProblem"("testId", "problemId");

-- CreateIndex
CREATE UNIQUE INDEX "TestProblem_testId_position_key" ON "TestProblem"("testId", "position");

-- AddForeignKey
ALTER TABLE "Test" ADD CONSTRAINT "Test_collectionId_fkey" FOREIGN KEY ("collectionId") REFERENCES "Collection"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestProblem" ADD CONSTRAINT "TestProblem_testId_fkey" FOREIGN KEY ("testId") REFERENCES "Test"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TestProblem" ADD CONSTRAINT "TestProblem_problemId_fkey" FOREIGN KEY ("problemId") REFERENCES "Problem"("id") ON DELETE CASCADE ON UPDATE CASCADE;
