import { ProviderFactory } from "../factory/provider.factory.js";

export class AnalysisService {

    static async analyze(jobData) {

        const provider =
            ProviderFactory.getProvider(jobData.provider);

        const pullRequest =
            await provider.getPullRequest(jobData);

        const files =
            await provider.getPullRequestFiles(jobData);

        console.log("========== PR ==========");
        console.log({
            number: pullRequest.number,
            title: pullRequest.title,
            author: pullRequest.author
        });

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
    }
}