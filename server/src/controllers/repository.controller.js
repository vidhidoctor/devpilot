import { prisma } from "../config/prisma.js";

import {
    successResponse,
    errorResponse
} from "../utils/response.js";


export const getRepositories = async (req, res) => {

    try {

        const repositories =
            await prisma.repository.findMany({

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    _count: {
                        select: {
                            pullRequests: true
                        }
                    }
                }
            });


        const data = repositories.map((repository) => ({

            id: repository.id,

            provider: repository.provider,

            owner: repository.owner,

            name: repository.name,

            fullName: repository.fullName,

            pullRequestCount:
                repository._count.pullRequests,

            createdAt: repository.createdAt,

            updatedAt: repository.updatedAt

        }));


        return successResponse(res, {
            data
        });

    } catch (error) {

        console.error(
            "❌ Failed to fetch repositories:",
            error
        );

        return errorResponse(
            res,
            "Failed to fetch repositories",
            500
        );
    }
};


export const getRepositoryById = async (req, res) => {

    try {

        const repositoryId =
            Number(req.params.id);


        if (Number.isNaN(repositoryId)) {

            return errorResponse(
                res,
                "Invalid repository ID",
                400
            );
        }


        const repository =
            await prisma.repository.findUnique({

                where: {
                    id: repositoryId
                },

                include: {
                    _count: {
                        select: {
                            pullRequests: true
                        }
                    }
                }
            });


        if (!repository) {

            return errorResponse(
                res,
                "Repository not found",
                404
            );
        }


        return successResponse(res, {

            repository: {

                id: repository.id,

                provider: repository.provider,

                owner: repository.owner,

                name: repository.name,

                fullName: repository.fullName,

                pullRequestCount:
                    repository._count.pullRequests,

                createdAt: repository.createdAt,

                updatedAt: repository.updatedAt

            }

        });

    } catch (error) {

        console.error(
            "❌ Failed to fetch repository:",
            error
        );

        return errorResponse(
            res,
            "Failed to fetch repository",
            500
        );
    }
};

export const getPullRequestsByRepository = async (req, res) => {

    try {

        const repositoryId =
            Number(req.params.repositoryId);


        if (Number.isNaN(repositoryId)) {

            return errorResponse(
                res,
                "Invalid repository ID",
                400
            );
        }


        // Check whether repository exists
        const repository =
            await prisma.repository.findUnique({

                where: {
                    id: repositoryId
                }
            });


        if (!repository) {

            return errorResponse(
                res,
                "Repository not found",
                404
            );
        }


        // Fetch pull requests
        const pullRequests =
            await prisma.pullRequest.findMany({

                where: {
                    repositoryId
                },

                orderBy: {
                    createdAt: "desc"
                },

                include: {
                    _count: {
                        select: {
                            analyses: true
                        }
                    }
                }
            });


        const data = pullRequests.map((pullRequest) => ({

            id: pullRequest.id,

            number: pullRequest.number,

            title: pullRequest.title,

            description: pullRequest.description,

            author: pullRequest.author,

            baseBranch: pullRequest.baseBranch,

            headBranch: pullRequest.headBranch,

            commitSha: pullRequest.commitSha,

            status: pullRequest.status,

            analysisCount:
                pullRequest._count.analyses,

            createdAt: pullRequest.createdAt,

            updatedAt: pullRequest.updatedAt

        }));


        return successResponse(res, {

            repository: {
                id: repository.id,
                fullName: repository.fullName
            },

            data

        });

    } catch (error) {

        console.error(
            "❌ Failed to fetch pull requests:",
            error
        );

        return errorResponse(
            res,
            "Failed to fetch pull requests",
            500
        );
    }
};