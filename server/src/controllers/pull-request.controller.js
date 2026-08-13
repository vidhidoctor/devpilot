import { prisma } from "../config/prisma.js";

import {
    successResponse,
    errorResponse
} from "../utils/response.js";



// =====================================================
// GET /pull-requests/:id
// Get details of one Pull Request
// =====================================================

export const getPullRequestById = async (req, res) => {
    try {
        const pullRequestId = Number(req.params.id);

        if (Number.isNaN(pullRequestId)) {
            return errorResponse(
                res,
                "Invalid pull request ID",
                400
            );
        }

        const pullRequest = await prisma.pullRequest.findUnique({
            where: {
                id: pullRequestId
            },
            include: {
                repository: true,
                changedFiles: {
                    orderBy: {
                        createdAt: "asc"
                    }
                },
                _count: {
                    select: {
                        analyses: true
                    }
                }
            }
        });

        if (!pullRequest) {
            return errorResponse(
                res,
                "Pull request not found",
                404
            );
        }

        return successResponse(res, {
            pullRequest: {
                id: pullRequest.id,
                number: pullRequest.number,
                title: pullRequest.title,
                description: pullRequest.description,
                author: pullRequest.author,
                baseBranch: pullRequest.baseBranch,
                headBranch: pullRequest.headBranch,
                commitSha: pullRequest.commitSha,
                status: pullRequest.status,
                repository: {
                    id: pullRequest.repository.id,
                    fullName: pullRequest.repository.fullName
                },
                changedFiles: pullRequest.changedFiles.map((file) => ({
                    id: file.id,
                    filename: file.filename,
                    status: file.status,
                    additions: file.additions,
                    deletions: file.deletions,
                    changes: file.changes,
                    patch: file.patch
                })),
                analysisCount: pullRequest._count.analyses,
                createdAt: pullRequest.createdAt,
                updatedAt: pullRequest.updatedAt
            }
        });

    } catch (error) {
        console.error(
            "❌ Failed to fetch pull request:",
            error
        );

        return errorResponse(
            res,
            "Failed to fetch pull request",
            500
        );
    }
};

// =====================================================
// GET /pull-requests/:id/analyses
// Get analysis history of one Pull Request
// =====================================================

export const getPullRequestAnalyses = async (req, res) => {
    try {
        const pullRequestId = Number(req.params.id);

        if (Number.isNaN(pullRequestId)) {
            return errorResponse(
                res,
                "Invalid pull request ID",
                400
            );
        }

        const pullRequest = await prisma.pullRequest.findUnique({
            where: {
                id: pullRequestId
            },
            include: {
                repository: true
            }
        });

        if (!pullRequest) {
            return errorResponse(
                res,
                "Pull request not found",
                404
            );
        }

        const analyses = await prisma.analysis.findMany({
            where: {
                pullRequestId
            },
            orderBy: {
                createdAt: "desc"
            },
            include: {
                _count: {
                    select: {
                        findings: true
                    }
                }
            }
        });

        const data = analyses.map((analysis) => ({
            id: analysis.id,
            status: analysis.status,
            commitSha: analysis.commitSha,
            findingCount: analysis._count.findings,
            createdAt: analysis.createdAt,
            completedAt: analysis.completedAt
        }));

        return successResponse(res, {
            pullRequest: {
                id: pullRequest.id,
                number: pullRequest.number,
                title: pullRequest.title,
                repository: pullRequest.repository.fullName
            },
            data
        });

    } catch (error) {
        console.error(
            "❌ Failed to fetch pull request analyses:",
            error
        );

        return errorResponse(
            res,
            "Failed to fetch pull request analyses",
            500
        );
    }
};