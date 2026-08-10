import "dotenv/config";

import { LLMService } from "./src/services/llm.service.js";

const result = await LLMService.reviewCode({

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
});

console.log("========== AI FINDINGS ==========");

console.dir(result, {
    depth: null
});