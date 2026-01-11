const express = require("express");
const fetch = require("node-fetch");
const app = express();
app.use(express.json());

const HF_TOKEN = process.env.HF_TOKEN; // store this in Render secret

// health check
app.get("/health", (req, res) => {
  res.json({ status: "ok" });
});

// chat endpoint
app.post("/chat", async (req, res) => {
  try {
    const { prompt } = req.body;

    const hfResponse = await fetch(
      "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": "Bearer " + HF_TOKEN
        },
        body: JSON.stringify({ inputs: prompt })
      }
    );

    const data = await hfResponse.json();

    // HF returns array or object depending on model
    let text = "";
    if (Array.isArray(data) && data[0].generated_text) {
      text = data[0].generated_text;
    } else if (data.generated_text) {
      text = data.generated_text;
    } else {
      text = JSON.stringify(data);
    }

    res.json({ reply: text });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Inference error" });
  }
});

// listen
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
