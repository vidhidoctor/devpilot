import { ProviderFactory } from "../factory/provider.factory.js";

export class AnalysisService {

    static async analyze(jobData) {

        const provider = ProviderFactory.getProvider(jobData.provider);

        const pullRequest =
            await provider.getPullRequest(jobData);

        console.log(pullRequest);

    }

}