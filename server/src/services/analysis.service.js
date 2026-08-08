import { ProviderFactory } from "../factory/provider.factory.js";
import { prisma } from "../config/prisma.js";
import { CodeAnalyzer } from "../analyzers/code.analyzer.js";

export class AnalysisService {

    static async analyze(jobData) {

        // 1. Get the correct provider
        const provider =
            ProviderFactory.getProvider(jobData.provider);

        // 2. Get PR information
        const pullRequest =
            await provider.getPullRequest(jobData);

        // 3. Get changed files
        const files =
            await provider.getPullRequestFiles(jobData);

        // 4. Display PR information
        console.log("========== PR ==========");

        console.log({
            number: pullRequest.number,
            title: pullRequest.title,
            author: pullRequest.author
        });

        // 5. Display changed files
        console.log("========== FILES ==========");

        for (const file of files) {

            console.log({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                patch: file.patch
            });

        }

        // 6. Find or create repository
        const repository =
            await prisma.repository.upsert({

                where: {
                    fullName:
                        `${jobData.owner}/${jobData.repo}`
                },

                update: {},

                create: {
                    provider: jobData.provider,
                    owner: jobData.owner,
                    name: jobData.repo,
                    fullName:
                        `${jobData.owner}/${jobData.repo}`
                }

            });

        // 7. Find or create the Pull Request
        const savedPullRequest =
            await prisma.pullRequest.upsert({

                where: {
                    repositoryId_number: {
                        repositoryId: repository.id,
                        number: pullRequest.number
                    }
                },

                update: {
                    title: pullRequest.title,
                    description: pullRequest.description,
                    author: pullRequest.author,
                    baseBranch: pullRequest.baseBranch,
                    headBranch: pullRequest.headBranch,
                    commitSha: pullRequest.commitSha,
                    status: "analyzed"
                },

                create: {
                    number: pullRequest.number,
                    title: pullRequest.title,
                    description: pullRequest.description,
                    author: pullRequest.author,
                    baseBranch: pullRequest.baseBranch,
                    headBranch: pullRequest.headBranch,
                    commitSha: pullRequest.commitSha,
                    status: "analyzed",
                    repositoryId: repository.id
                }

            });

        // 8. Remove old files for this PR
        await prisma.changedFile.deleteMany({
            where: {
                pullRequestId: savedPullRequest.id
            }
        });

        // 9. Save the current changed files
        await prisma.changedFile.createMany({
            data: files.map((file) => ({
                filename: file.filename,
                status: file.status,
                additions: file.additions,
                deletions: file.deletions,
                changes: file.changes,
                patch: file.patch || null,
                pullRequestId: savedPullRequest.id
            }))
        });

        // 10. Create analysis
        const analysis = await prisma.analysis.create({
            data: {
                status: "running",
                pullRequestId: savedPullRequest.id
            }
        });

        console.log("✅ Analysis created:", analysis.id);

        // 11. Get saved changed files
        const changedFiles = await prisma.changedFile.findMany({
            where: {
                pullRequestId: savedPullRequest.id
            }
        });

        // 12. Analyze each changed file
        const findings = [];

        for (const file of changedFiles) {

            const fileFindings =
                CodeAnalyzer.analyzeFile(file);

            for (const finding of fileFindings) {

                findings.push({
                    ...finding,
                    analysisId: analysis.id,
                    changedFileId: file.id
                });

            }

        }

        // 13. Save findings
        if (findings.length > 0) {

            await prisma.finding.createMany({
                data: findings
            });

            console.log(
                `✅ ${findings.length} findings saved`
            );

        } else {

            console.log("✅ No findings detected");

        }

        // 14. Mark analysis as completed
        await prisma.analysis.update({
            where: {
                id: analysis.id
            },
            data: {
                status: "completed",
                completedAt: new Date()
            }
        });

        console.log("✅ Analysis completed");
        console.log("✅ PR saved to PostgreSQL");

    }

}