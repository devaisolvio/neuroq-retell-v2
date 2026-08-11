import express from "express";

const app = express();
app.use(express.json({ limit: "1mb" }));
app.use(express.static("public"));

const RETELL_API_KEY = process.env.RETELL_API_KEY;
const RETELL_AGENT_ID = process.env.RETELL_AGENT_ID;

// Mint a Retell web-call access token (key stays server-side).
app.post("/retell/web-call", async (req, res) => {
  try {
    const agentId = (req.body?.agent_id || RETELL_AGENT_ID || "").toString();
    const r = await fetch("https://api.retellai.com/v2/create-web-call", {
      method: "POST",
      headers: { Authorization: `Bearer ${RETELL_API_KEY}`, "Content-Type": "application/json" },
      body: JSON.stringify({ agent_id: agentId }),
    });
    if (!r.ok) {
      const detail = await r.text();
      console.error("retell error:", r.status, detail.slice(0, 200));
      return res.status(502).json({ error: "web-call failed", status: r.status });
    }
    const data = await r.json();
    res.json({ access_token: data.access_token, call_id: data.call_id });
  } catch (err) {
    console.error("retell error:", err?.message || err);
    res.status(500).json({ error: "web-call failed" });
  }
});

app.get("/healthz", (req, res) => {
  res.json({ ok: true, hasRetell: !!RETELL_API_KEY });
});

const port = process.env.PORT || 3000;
app.listen(port, () => console.log(`NeuroQ Retell picker on ${port}`));
