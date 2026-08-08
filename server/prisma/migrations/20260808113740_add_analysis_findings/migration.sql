-- CreateTable
CREATE TABLE "Analysis" (
    "id" SERIAL NOT NULL,
    "status" TEXT NOT NULL,
    "summary" TEXT,
    "pullRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" TIMESTAMP(3),

    CONSTRAINT "Analysis_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Finding" (
    "id" SERIAL NOT NULL,
    "severity" TEXT NOT NULL,
    "category" TEXT,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "suggestion" TEXT,
    "lineNumber" INTEGER,
    "analysisId" INTEGER NOT NULL,
    "changedFileId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Finding_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Analysis" ADD CONSTRAINT "Analysis_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_analysisId_fkey" FOREIGN KEY ("analysisId") REFERENCES "Analysis"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Finding" ADD CONSTRAINT "Finding_changedFileId_fkey" FOREIGN KEY ("changedFileId") REFERENCES "ChangedFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
