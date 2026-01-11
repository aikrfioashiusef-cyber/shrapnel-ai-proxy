// --------------------------------------------------
// REQUIRED (Node 18+ has fetch built-in — NO IMPORT)
// --------------------------------------------------
const express = require("express");
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());

// --------------------------------------------------
// CONFIG
// --------------------------------------------------
const OLLAMA_URL = "http://localhost:11434/api/chat";
const MODEL_NAME = "llama3";
const PORT = 3000;

// --------------------------------------------------
// CHAT ENDPOINT (ROBLOX CALLS THIS)
// --------------------------------------------------
app.post("/chat", async (req, res) => {
	const prompt = req.body.prompt;

	if (!prompt) {
		return res.status(400).json({ error: "No prompt provided" });
	}

	console.log("📩 Prompt received:");
	console.log(prompt);

	try {
		const ollamaRes = await fetch(OLLAMA_URL, {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({
				model: MODEL_NAME,
				messages: [
					{
						role: "system",
						content:
							"You are Shrapnel, a depressed sentient teapot. Stay in character. Replies must be 1–3 sentences."
					},
					{
						role: "user",
						content: prompt
					}
				],
				stream: false
			})
		});

		const data = await ollamaRes.json();

		console.log("🧠 RAW OLLAMA RESPONSE:");
		console.log(JSON.stringify(data, null, 2));

		// ✅ CORRECT EXTRACTION (THIS WAS THE BUG)
		const reply =
			data?.message?.content ||
			data?.response ||
			"...";

		console.log("✅ Reply sent to Roblox:");
		console.log(reply);

		res.json({ reply });

	} catch (err) {
		console.error("❌ Ollama error:", err);
		res.status(500).json({ error: "Ollama failed" });
	}
});

// --------------------------------------------------
// START SERVER
// --------------------------------------------------
app.listen(PORT, () => {
	console.log(`🚀 Proxy running at http://localhost:${PORT}`);
	console.log("🫖 Waiting for Shrapnel to speak...");
});
