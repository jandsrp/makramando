import { GoogleGenAI } from "@google/genai";
import { exec } from "child_process";
import fs from "fs";
import path from "path";
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Read .env.local manually to avoid adding dotenv dependency
const envPath = path.resolve(__dirname, "../.env.local");
let apiKey = "";

try {
    if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, "utf-8");
        const match = envContent.match(/VITE_GEMINI_API_KEY=(.*)/);
        if (match && match[1]) {
            apiKey = match[1].trim();
            // Remove quotes if present
            if ((apiKey.startsWith('"') && apiKey.endsWith('"')) || (apiKey.startsWith("'") && apiKey.endsWith("'"))) {
                apiKey = apiKey.slice(1, -1);
            }
        }
    }
} catch (error) {
    console.error("Error reading .env.local:", error);
}

if (!apiKey) {
    console.error("❌ Error: VITE_GEMINI_API_KEY not found in .env.local");
    process.exit(1);
}

const genAI = new GoogleGenAI(apiKey);

exec("git diff --cached", async (error, stdout, stderr) => {
    if (error) {
        console.error("❌ Error getting git diff:", error.message);
        return;
    }
    if (!stdout.trim()) {
        console.log("⚠️ No staged changes found. Stage your changes with 'git add' first.");
        return;
    }

    try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // Prompt aligned with Conventional Commits
        const prompt = `You are an expert developer. Generate a concise and descriptive commit message adhering to the Conventional Commits specification (e.g., feat:, fix:, chore:, docs:, style:, refactor:, perf:, test:) based on the following git diff.
    
    Rules:
    - Use the imperative mood (e.g., "add feature" not "added feature").
    - Do not end the subject line with a period.
    - Keep the subject line under 50 characters if possible.
    - If the changes are significant, provide a short body description.
    - Output ONLY the commit message, no markdown code blocks or explanations.

    Git Diff:
    ${stdout.slice(0, 10000)} // Truncate to avoid token limits if diff is huge
    `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log("\n✨ Generated Commit Message:\n");
        console.log(text.trim());
        console.log("\n--------------------------------------------------");
        console.log("👉 Copy the message above or run: git commit -m \"" + text.trim().replace(/"/g, '\\"') + "\"");

    } catch (err) {
        console.error("❌ Error generating commit message via Gemini:", err);
    }
});
