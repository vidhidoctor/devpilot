import { Octokit } from "octokit";
import { BaseProvider } from "./base.provider.js";

export class GithubProvider extends BaseProvider {

    constructor() {
        super();

        this.client = new Octokit({
            auth: process.env.GITHUB_TOKEN
        });
    }

    async getPullRequest(jobData) {

        const { owner, repo, prNumber } = jobData;

        const response = await this.client.rest.pulls.get({
            owner,
            repo,
            pull_number: prNumber
        });

        const pr = response.data;

        return {
            id: pr.id,
            number: pr.number,
            title: pr.title,
            description: pr.body,
            author: pr.user.login,
            baseBranch: pr.base.ref,
            headBranch: pr.head.ref,
            commitSha: pr.head.sha
        };
    }

    async getPullRequestFiles(jobData) {
        const { owner, repo, prNumber } = jobData;

        const response = await this.client.rest.pulls.listFiles({
            owner,
            repo,
            pull_number: prNumber
        });

        return response.data.map((file) => ({
            filename: file.filename,
            status: file.status,
            additions: file.additions,
            deletions: file.deletions,
            changes: file.changes,
            patch: file.patch || null
        }));
    }
}