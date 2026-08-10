import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY
});

const reviewSchema = {
    type: "object",
    properties: {
        findings: {
            type: "array",
            items: {
                type: "object",
                properties: {
                    severity: {
                        type: "string",
                        enum: [
                            "low",
                            "medium",
                            "high",
                            "critical"
                        ]
                    },
                    category: {
                        type: "string",
                        enum: [
                            "bug",
                            "security",
                            "performance",
                            "code-quality"
                        ]
                    },
                    title: {
                        type: "string"
                    },
                    message: {
                        type: "string"
                    },
                    suggestion: {
                        type: "string"
                    },
                    lineNumber: {
                        type: ["integer", "null"]
                    }
                },
                required: [
                    "severity",
                    "category",
                    "title",
                    "message",
                    "suggestion",
                    "lineNumber"
                ]
            }
        }
    },
    required: ["findings"]
};

export class LLMService {

    static async reviewCode({
        filename,
        patch
    }) {

        const prompt = `
You are an expert code reviewer.

Review the provided Git diff carefully.

Only report real or highly likely issues.

Do not report stylistic preferences unless they have
a meaningful impact on:

- maintainability
- correctness
- security
- performance

Analyze only the changed code.

If there are no meaningful issues, return an empty findings array.

File:
${filename}

Git diff:
${patch || "No textual patch available."}
`;

        const response = await ai.models.generateContent({

            model: "gemini-3.5-flash-lite",

            contents: prompt,

            config: {
                systemInstruction:
                    "You are an expert software code reviewer.",

                responseMimeType: "application/json",

                responseSchema: reviewSchema
            }
        });

        return JSON.parse(response.text);
    }
}