const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const prompt = req.body.prompt;

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/Qwen/Qwen2.5-0.5B-Instruct",
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.HF_TOKEN}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: prompt,
          parameters: {
            max_new_tokens: 120,
            temperature: 0.7
          }
        })
      }
    );

    const data = await hfResponse.json();

    // Hugging Face sometimes returns array, sometimes object
    let reply =
      Array.isArray(data) && data[0]?.generated_text
        ? data[0].generated_text
        : data.generated_text || "…";

    res.json({ reply });

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("🚀 Shrapnel proxy running on port", PORT);
});
