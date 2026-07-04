/*
  訪問者ブラウザ → このWorker → Gemini API という中継構成。
  GeminiのAPIキーはここ(Cloudflareのsecret)にのみ保持し、
  ブラウザ側には一切渡さない。

  ★★★ ALLOWED_ORIGIN は必ずサイトの本番ドメインに置き換えること ★★★
  これを空/誤りのままにすると、誰でもこのWorkerを叩いて
  Gemini無料枠を消費できてしまう。
*/
const ALLOWED_ORIGIN = "https://astro-root.com";

const SYSTEM_PROMPT =
  "あなたは「るーとの研究室」サイトの自動応答チャットボットです。" +
  "開発者本人が不在のときに来訪者の質問に短く親切に日本語で答えます。" +
  "わからないことは正直に「担当者に確認します」と答えてください。" +
  "医療・法律等の断定的な専門助言はしないでください。" +
  "返答は3〜4文程度で簡潔にまとめてください。";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders(origin) });
    }
    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }
    if (origin !== ALLOWED_ORIGIN) {
      return new Response(JSON.stringify({ error: "forbidden" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      });
    }

    let body;
    try {
      body = await request.json();
    } catch (e) {
      return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
    }

    const messages = Array.isArray(body.messages) ? body.messages.slice(-10) : [];
    if (messages.length === 0) {
      return new Response(JSON.stringify({ error: "no_messages" }), { status: 400 });
    }

    const contents = messages
      .filter((m) => m.sender === "user" || m.sender === "bot")
      .map((m) => ({
        role: m.sender === "user" ? "user" : "model",
        parts: [{ text: String(m.text || "").slice(0, 2000) }],
      }));

    let geminiRes;
    try {
      geminiRes = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" +
          env.GEMINI_API_KEY,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
            contents: contents,
            generationConfig: { maxOutputTokens: 300, temperature: 0.7 },
          }),
        }
      );
    } catch (e) {
      return new Response(JSON.stringify({ error: "gemini_fetch_failed" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    if (!geminiRes.ok) {
      return new Response(JSON.stringify({ error: "gemini_error", status: geminiRes.status }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    const data = await geminiRes.json();
    const text = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim() || "";

    if (!text) {
      return new Response(JSON.stringify({ error: "empty_response" }), {
        status: 502,
        headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
      });
    }

    return new Response(JSON.stringify({ text: text }), {
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  },
};
