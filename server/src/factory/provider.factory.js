import { GithubProvider } from "../providers/github.provider.js";

export class ProviderFactory {

    static getProvider(provider) {

        switch (provider) {

            case "github":
                return new GithubProvider();

            default:
                throw new Error(`Unsupported provider: ${provider}`);

        }

    }

}