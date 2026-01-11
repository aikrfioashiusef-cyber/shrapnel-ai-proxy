const express = require("express");
const fetch = require("node-fetch");

const app = express();
app.use(express.json());

const HF_API_KEY = process.env.HF_API_KEY;
const MODEL = "HuggingFaceH4/zephyr-7b-beta";

app.get("/health", (req, res) => {
  res.json({ status: "ok", backend: "huggingface" });
});

app.post("/chat", async (req, res) => {
  try {
    const messages = req.body.prompt;

    const response = await fetch(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${HF_API_KEY}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          inputs: messages.map(m => `${m.role}: ${m.content}`).join("\n"),
          parameters: {
            max_new_tokens: 120,
            temperature: 0.7
          }
        })
      }
    );

    const data = await response.json();

    if (data.error) {
      return res.status(500).json({ error: data.error });
    }

    const reply =
      data.generated_text?.split("assistant:").pop()?.trim()
      || "…";

    res.json({ reply });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Shrapnel HF proxy running on port ${PORT}`);
});
