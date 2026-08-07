import { BaseProvider } from "./base.provider.js";

export class GithubProvider extends BaseProvider {

    async getPullRequest(jobData){

        console.log("Github Provider");

        console.log(jobData);

        return {

            id: jobData.prNumber,

            title: jobData.title,

            repository: jobData.repository

        };

    }

}