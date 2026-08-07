export class BaseProvider {

    async getPullRequest() {
        throw new Error("Method not implemented");
    }

    async getPullRequestFiles() {
        throw new Error("Method not implemented");
    }

    async getPullRequestDiff() {
        throw new Error("Method not implemented");
    }

}