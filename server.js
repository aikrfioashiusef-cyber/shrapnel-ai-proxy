const express = require("express")
const fetch = require("node-fetch")

const app = express()
app.use(express.json())

// ✅ Health check
app.get("/health", (req, res) => {
  res.json({ status: "ok", ollama: "connected" })
})

// ✅ Chat endpoint (Roblox-compatible)
app.post("/chat", async (req, res) => {
  try {
    const { messages } = req.body

    console.log("📩 Messages received:")
    console.log(messages)

    const response = await fetch("http://localhost:11434/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3",
        messages: messages,
        stream: false
      })
    })

    const data = await response.json()

    const reply = data.message.content

    console.log("🤖 Reply:")
    console.log(reply)
    console.log("────────────")

    // 🔁 OpenAI-style response (Roblox expects this)
    res.json({
      choices: [
        {
          message: {
            content: reply
          }
        }
      ]
    })
  } catch (err) {
    console.error("❌ Error:", err)
    res.status(500).json({ error: "AI error" })
  }
})
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
	console.log("🚀 Shrapnel proxy running on port", PORT);
});
