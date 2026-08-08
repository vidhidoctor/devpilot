export class CodeAnalyzer {

    static analyzeFile(file) {

        const findings = [];

        const patch = file.patch;

        if (!patch) {
            return findings;
        }

        // Rule 1: Detect console.log()
        if (patch.includes("console.log")) {

            findings.push({
                severity: "low",
                category: "code-quality",
                title: "Console statement detected",
                message: "Avoid leaving console.log statements in production code.",
                suggestion: "Remove the console.log or replace it with a proper logging mechanism."
            });
        }

        return findings;
    }
}