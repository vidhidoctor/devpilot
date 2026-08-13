import { ProviderFactory } from "../factory/provider.factory.js";
import { prisma } from "../config/prisma.js";
import { CodeAnalyzer } from "../analyzers/code.analyzer.js";

export class AnalysisService {

    static async analyze(jobData) {

        let analysis = null;
        let savedPullRequest = null;

        try {

            // ==========================================
            // 1. Get the correct provider
            // ==========================================

            const provider =
                ProviderFactory.getProvider(jobData.provider);


            // ==========================================
            // 2. Get PR information
            // ==========================================

            const pullRequest =
                await provider.getPullRequest(jobData);

            console.log("========== PR ==========");

            console.log({
                number: pullRequest.number,
                title: pullRequest.title,
                author: pullRequest.author
            });


            // ==========================================
            // 3. Find or create repository
            // ==========================================

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


            // ==========================================
            // 4. Find or create Pull Request
            // ==========================================

            savedPullRequest =
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
                        status: "analyzing"
                    },

                    create: {
                        number: pullRequest.number,
                        title: pullRequest.title,
                        description: pullRequest.description,
                        author: pullRequest.author,
                        baseBranch: pullRequest.baseBranch,
                        headBranch: pullRequest.headBranch,
                        commitSha: pullRequest.commitSha,
                        status: "analyzing",
                        repositoryId: repository.id
                    }
                });


            // ==========================================
            // 5. Check whether this commit was already analyzed
            // ==========================================

            const existingAnalysis =
                await prisma.analysis.findUnique({

                    where: {
                        pullRequestId_commitSha: {
                            pullRequestId:
                                savedPullRequest.id,

                            commitSha:
                                jobData.commitSha
                        }
                    }
                });


            if (existingAnalysis) {

                console.log(
                    `⏭️ Analysis already exists for PR #${pullRequest.number} and commit ${jobData.commitSha}`
                );

                return;
            }


            // ==========================================
            // 6. Get changed files from GitHub
            // ==========================================

            const files =
                await provider.getPullRequestFiles(jobData);


            console.log(
                `📁 ${files.length} changed files found`
            );


            // ==========================================
            // 7. Save current changed files
            // ==========================================

            await prisma.changedFile.deleteMany({

                where: {
                    pullRequestId:
                        savedPullRequest.id
                }
            });


            if (files.length > 0) {

                await prisma.changedFile.createMany({

                    data: files.map((file) => ({

                        filename: file.filename,
                        status: file.status,
                        additions: file.additions,
                        deletions: file.deletions,
                        changes: file.changes,
                        patch: file.patch || null,

                        pullRequestId:
                            savedPullRequest.id
                    }))
                });
            }


            // ==========================================
            // 8. Create Analysis
            // ==========================================

            analysis =
                await prisma.analysis.create({

                    data: {
                        status: "running",

                        commitSha:
                            jobData.commitSha,

                        pullRequestId:
                            savedPullRequest.id
                    }
                });


            console.log(
                "🔍 Analysis started:",
                analysis.id
            );


            // ==========================================
            // 9. Run Code Analyzer
            // ==========================================

            const findings =
                await CodeAnalyzer.analyze(files);


            console.log(
                `🤖 ${findings.length} findings detected`
            );


            // ==========================================
            // 10. Get saved files from database
            // ==========================================

            const savedFiles =
                await prisma.changedFile.findMany({

                    where: {
                        pullRequestId:
                            savedPullRequest.id
                    }
                });


            // ==========================================
            // 11. Create filename → database ID map
            // ==========================================

            const fileMap =
                new Map(
                    savedFiles.map((file) => [
                        file.filename,
                        file.id
                    ])
                );


            // ==========================================
            // 12. Prepare findings
            // ==========================================

            const findingsToSave =
                findings.map((finding) => ({

                    severity:
                        finding.severity,

                    category:
                        finding.category,

                    title:
                        finding.title,

                    message:
                        finding.message,

                    suggestion:
                        finding.suggestion,

                    lineNumber:
                        finding.lineNumber,

                    analysisId:
                        analysis.id,

                    changedFileId:
                        fileMap.get(
                            finding.filename
                        ) ?? null
                }));


            // ==========================================
            // 13. Save findings
            // ==========================================

            if (findingsToSave.length > 0) {

                await prisma.finding.createMany({

                    data: findingsToSave
                });

                console.log(
                    `✅ ${findingsToSave.length} findings saved`
                );

            } else {

                console.log(
                    "✅ No findings detected"
                );
            }


            // ==========================================
            // 14. Mark analysis as completed
            // ==========================================

            await prisma.analysis.update({

                where: {
                    id: analysis.id
                },

                data: {
                    status: "completed",
                    completedAt: new Date()
                }
            });


            // ==========================================
            // 15. Mark PR as analyzed
            // ==========================================

            await prisma.pullRequest.update({

                where: {
                    id: savedPullRequest.id
                },

                data: {
                    status: "analyzed"
                }
            });


            console.log(
                "✅ Analysis completed"
            );

            console.log(
                "✅ PR saved to PostgreSQL"
            );

        } catch (error) {

            console.error(
                "❌ Analysis failed:",
                error
            );


            // ==========================================
            // Mark analysis as failed
            // ==========================================

            if (analysis) {

                await prisma.analysis.update({

                    where: {
                        id: analysis.id
                    },

                    data: {
                        status: "failed"
                    }
                });
            }


            // ==========================================
            // Mark PR as failed
            // ==========================================

            if (savedPullRequest) {

                await prisma.pullRequest.update({

                    where: {
                        id: savedPullRequest.id
                    },

                    data: {
                        status: "failed"
                    }
                });
            }


            // ==========================================
            // Let BullMQ handle the failure/retry
            // ==========================================

            throw error;
        }
    }
}