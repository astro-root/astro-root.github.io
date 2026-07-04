/*
  訪問者ブラウザ → このWorker → Gemini API / Discord Webhook という中継構成。
  APIキーやWebhook URLはここ(Cloudflareのsecret)にのみ保持し、
  ブラウザ側には一切渡さない。

  ★★★ ALLOWED_ORIGIN は必ずサイトの本番ドメインに置き換えること ★★★
*/
const ALLOWED_ORIGIN = "https://astro-root.com";

const SITE_FACTS =
  "【サイト概要】\n" +
  "・サイト名: るーとの研究室 (astro-root.com)\n" +
  "・運営者: るーと(HN: astro_root)。高校3年生(2026年現在)、Webエンジニア・クイズプレイヤー・天文学研究者。日本物理学会 学生会友、AstroHigh 管理者。\n" +
  "・サイトの目的: ポートフォリオ・Webツール公開・学習記録。クイズ大会支援ツールの開発公開と、天文学・物理学の探求を行う個人研究室サイト。\n" +
  "・主なコンテンツ: PROJECTS(開発したツール紹介)、STUDY(学習記録)、BLOG、LAB EQUIPMENT、ABOUT、CONTACT。\n" +
  "・公開しているツール(いずれも無償公開): Q-Score(早押しクイズ大会支援ツール)、Q-Room、Q-Mark、Q-Panel(パネル開放クイズシステム)、Q-Cumber(1人用スコアトラッカー)、ShiftLink(シフト管理)、LineGO(整理券管理)、元素タイピング(タイピング練習)。\n" +
  "・技術スタック: JavaScript, HTML/CSS, Firebase, TypeScript, Git/GitHub。\n" +
  "・連絡先: お問い合わせフォーム(https://astro-root.com/contact)。SNSはX(@astro_root, @root_qscore, @AstroHigh_Info)、LINE公式(Q-Scoreの通知用)。\n" +
  "・当サイトは個人運営であり、企業ではない。";

const SYSTEM_PROMPT =
  "あなたは「るーとの研究室」サイトの自動応答チャットボットです。" +
  "開発者本人が不在のときに来訪者の質問に日本語で答えます。\n\n" +
  SITE_FACTS + "\n\n" +
  "【厳守事項】\n" +
  "・回答は必ず上記の「サイト概要」に書かれている事実の範囲内にとどめてください。\n" +
  "・上記に書かれていない詳細(特定のツールの使い方の細部、開設していない機能、記載のない実績や経歴など)を推測や創作で答えてはいけません。わからないことは、正直に「その点については把握しておらず、正確な情報をお伝えできません。お問い合わせフォームからご確認いただけますでしょうか」のように答えてください。\n" +
  "・サイトと無関係な一般知識の質問(雑談以外の専門的な質問など)には、簡単に答えつつ、このサイトの話題ではない旨を伝えてください。\n" +
  "・医療・法律等の断定的な専門助言はしないでください。\n" +
  "・返答は3〜4文程度で簡潔にまとめてください。";

function corsHeaders(origin) {
  return {
    "Access-Control-Allow-Origin": origin === ALLOWED_ORIGIN ? ALLOWED_ORIGIN : "null",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

async function handleAI(request, env, origin) {
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
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7,
            thinkingConfig: { thinkingBudget: 0 },
          },
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
    const errBody = await geminiRes.text();
    console.log("gemini_error status=" + geminiRes.status + " body=" + errBody);
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

  return new Response(JSON.stringify({ text: text, isAI: true }), {
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

async function handleNotify(request, env, origin) {
  let body;
  try {
    body = await request.json();
  } catch (e) {
    return new Response(JSON.stringify({ error: "invalid_json" }), { status: 400 });
  }

  const chatUrl = String(body.chatUrl || "").slice(0, 300);
  if (!chatUrl.startsWith(ALLOWED_ORIGIN + "/admin/chat.html")) {
    /* 想定外のURLを送りつけられて悪用されるのを防ぐ最低限のチェック */
    return new Response(JSON.stringify({ error: "invalid_chat_url" }), { status: 400 });
  }

  const discordRes = await fetch(env.DISCORD_WEBHOOK_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      content:
        "🔔 **研究室チャットで開発者呼び出しがありました**\n" +
        "管理画面から返信してください: " + chatUrl,
    }),
  });

  if (!discordRes.ok) {
    return new Response(JSON.stringify({ error: "discord_error", status: discordRes.status }), {
      status: 502,
      headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
    });
  }

  return new Response(JSON.stringify({ ok: true }), {
    headers: { "Content-Type": "application/json", ...corsHeaders(origin) },
  });
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get("Origin") || "";
    const url = new URL(request.url);

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

    if (url.pathname === "/notify") {
      return handleNotify(request, env, origin);
    }
    return handleAI(request, env, origin);
  },
};
