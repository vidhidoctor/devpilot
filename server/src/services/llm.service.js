import OpenAI from "openai";

const client = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY
});

export class LLMService {

    static async reviewCode({
        filename,
        patch
    }) {

        const response = await client.responses.create({

            model: "gpt-5-mini",

            input: [
                {
                    role: "system",
                    content: `
You are an expert code reviewer.

Review the provided Git diff carefully.

Only report real or highly likely issues.
Do not report stylistic preferences unless they have a meaningful
impact on maintainability, correctness, security, or performance.

Return ONLY valid JSON.

The JSON must follow this structure:

{
  "findings": [
    {
      "severity": "low | medium | high | critical",
      "category": "bug | security | performance | code-quality",
      "title": "short title",
      "message": "explanation of the issue",
      "suggestion": "how to fix it",
      "lineNumber": number or null
    }
  ]
}

If there are no meaningful issues, return:

{
  "findings": []
}
`
                },
                {
                    role: "user",
                    content: `
File: ${filename}

Git diff:

${patch}
`
                }
            ]
        });

        return JSON.parse(response.output_text);
    }
}