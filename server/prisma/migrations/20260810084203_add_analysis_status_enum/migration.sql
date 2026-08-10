/*
  Warnings:

  - The `status` column on the `Analysis` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "AnalysisStatus" AS ENUM ('pending', 'running', 'completed', 'failed');

-- AlterTable
ALTER TABLE "Analysis" DROP COLUMN "status",
ADD COLUMN     "status" "AnalysisStatus" NOT NULL DEFAULT 'pending';
