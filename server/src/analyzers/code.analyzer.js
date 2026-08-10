import { LLMService } from "../services/llm.service.js";

export class CodeAnalyzer {

    static async analyze(files) {

        const allFindings = [];

        for (const file of files) {

            // Skip files without a textual patch
            if (!file.patch) {
                console.log(
                    ` Skipping ${file.filename} - no patch available`
                );

                continue;
            }

            console.log(
                ` Analyzing ${file.filename}`
            );

            const result =
                await LLMService.reviewCode({
                    filename: file.filename,
                    patch: file.patch
                });

            allFindings.push(
                ...result.findings.map((finding) => ({
                    ...finding,
                    filename: file.filename
                }))
            );
        }

        return allFindings;
    }
}