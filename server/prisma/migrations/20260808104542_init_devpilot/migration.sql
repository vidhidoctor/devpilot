/*
  Warnings:

  - The primary key for the `PullRequest` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `prNumber` on the `PullRequest` table. All the data in the column will be lost.
  - The `id` column on the `PullRequest` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - The primary key for the `Repository` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The `id` column on the `Repository` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[repositoryId,number]` on the table `PullRequest` will be added. If there are existing duplicate values, this will fail.
  - A unique constraint covering the columns `[fullName]` on the table `Repository` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `author` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `baseBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `commitSha` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `headBranch` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Added the required column `number` to the `PullRequest` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `status` on the `PullRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Changed the type of `repositoryId` on the `PullRequest` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `fullName` to the `Repository` table without a default value. This is not possible if the table is not empty.
  - Changed the type of `provider` on the `Repository` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.

*/
-- DropForeignKey
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_repositoryId_fkey";

-- AlterTable
ALTER TABLE "PullRequest" DROP CONSTRAINT "PullRequest_pkey",
DROP COLUMN "prNumber",
ADD COLUMN     "author" TEXT NOT NULL,
ADD COLUMN     "baseBranch" TEXT NOT NULL,
ADD COLUMN     "commitSha" TEXT NOT NULL,
ADD COLUMN     "description" TEXT,
ADD COLUMN     "headBranch" TEXT NOT NULL,
ADD COLUMN     "number" INTEGER NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "status",
ADD COLUMN     "status" TEXT NOT NULL,
DROP COLUMN "repositoryId",
ADD COLUMN     "repositoryId" INTEGER NOT NULL,
ADD CONSTRAINT "PullRequest_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "Repository" DROP CONSTRAINT "Repository_pkey",
ADD COLUMN     "fullName" TEXT NOT NULL,
DROP COLUMN "id",
ADD COLUMN     "id" SERIAL NOT NULL,
DROP COLUMN "provider",
ADD COLUMN     "provider" TEXT NOT NULL,
ADD CONSTRAINT "Repository_pkey" PRIMARY KEY ("id");

-- DropEnum
DROP TYPE "Provider";

-- DropEnum
DROP TYPE "PullRequestStatus";

-- CreateTable
CREATE TABLE "ChangedFile" (
    "id" SERIAL NOT NULL,
    "filename" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "additions" INTEGER NOT NULL,
    "deletions" INTEGER NOT NULL,
    "changes" INTEGER NOT NULL,
    "patch" TEXT,
    "pullRequestId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ChangedFile_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PullRequest_repositoryId_number_key" ON "PullRequest"("repositoryId", "number");

-- CreateIndex
CREATE UNIQUE INDEX "Repository_fullName_key" ON "Repository"("fullName");

-- AddForeignKey
ALTER TABLE "PullRequest" ADD CONSTRAINT "PullRequest_repositoryId_fkey" FOREIGN KEY ("repositoryId") REFERENCES "Repository"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ChangedFile" ADD CONSTRAINT "ChangedFile_pullRequestId_fkey" FOREIGN KEY ("pullRequestId") REFERENCES "PullRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
