const ANTHROPIC_MODEL = 'claude-sonnet-5';
// gemini-2.0-flash was shut down June 2026; try current models in order.
const GEMINI_MODELS = ['gemini-2.5-flash', 'gemini-2.5-flash-lite', 'gemini-3-flash-preview'];

const SYSTEM_PROMPT = `You punch up LinkedIn post drafts. Keep every fact, claim, and hashtag from
the original — do not invent details or remove substance. Make the tone warmer and more
engaging, tighten flabby sentences, and add a small number of well-placed emoji (not one
per line, just enough to feel human). Keep roughly the same length. Output ONLY the
rewritten post text, with no preamble, no quotation marks, and no commentary about what
you changed.`;

async function punchUpAnthropic({ apiKey, text }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages: [{ role: 'user', content: text }],
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch (_e) {
      /* ignore */
    }
    throw new Error(`AI rewrite failed (${res.status}) ${detail}`);
  }

  const data = await res.json();
  const rewritten = data?.content?.find((block) => block.type === 'text')?.text;
  if (!rewritten) throw new Error('AI returned no text.');
  return rewritten.trim();
}

async function punchUpGeminiWithModel({ apiKey, text, model }) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'content-type': 'application/json' },
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_PROMPT }] },
      contents: [{ role: 'user', parts: [{ text }] }],
      generationConfig: { maxOutputTokens: 1024 },
    }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const body = await res.json();
      detail = body?.error?.message || JSON.stringify(body);
    } catch (_e) {
      /* ignore */
    }
    const err = new Error(`AI rewrite failed (${res.status}) ${detail}`);
    err.status = res.status;
    throw err;
  }

  const data = await res.json();
  const rewritten = data?.candidates?.[0]?.content?.parts?.find((part) => part.text)?.text;
  if (!rewritten) throw new Error('AI returned no text.');
  return rewritten.trim();
}

function isGeminiQuotaError(err) {
  const message = err?.message || '';
  return err?.status === 429 || /quota|limit:\s*0|RESOURCE_EXHAUSTED/i.test(message);
}

async function punchUpGemini({ apiKey, text }) {
  let lastError;

  for (const model of GEMINI_MODELS) {
    try {
      return await punchUpGeminiWithModel({ apiKey, text, model });
    } catch (err) {
      lastError = err;
      if (!isGeminiQuotaError(err)) throw err;
    }
  }

  throw new Error(
    `${lastError?.message || 'Gemini quota exceeded.'}\n\n` +
      'Tips: In Google AI Studio, open your project → Billing → link a billing account ' +
      '(free-tier limits still apply). Also confirm the Generative Language API is enabled ' +
      'for your key at https://aistudio.google.com/apikey'
  );
}

async function punchUp({ provider = 'anthropic', apiKey, text }) {
  if (provider === 'gemini') {
    return punchUpGemini({ apiKey, text });
  }
  return punchUpAnthropic({ apiKey, text });
}

module.exports = { punchUp };
