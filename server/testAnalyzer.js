import "dotenv/config";

import { CodeAnalyzer } from "./src/analyzers/code.analyzer.js";

const files = [
    {
        filename: "index.js",

        patch: `
@@ -8,4 +8,9 @@

function subtract(a, b) {
    return a - b;
}

+function divide(a, b) {
+    return a / b;
+    console.log("This is a test okay");
+}
`
    }
];

const findings =
    await CodeAnalyzer.analyze(files);

console.log("========== ALL FINDINGS ==========");

console.dir(findings, {
    depth: null
});