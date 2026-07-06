const MODEL = 'claude-sonnet-5';

const SYSTEM_PROMPT = `You punch up LinkedIn post drafts. Keep every fact, claim, and hashtag from
the original — do not invent details or remove substance. Make the tone warmer and more
engaging, tighten flabby sentences, and add a small number of well-placed emoji (not one
per line, just enough to feel human). Keep roughly the same length. Output ONLY the
rewritten post text, with no preamble, no quotation marks, and no commentary about what
you changed.`;

async function punchUp({ apiKey, text }) {
  const res = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': apiKey,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: MODEL,
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

module.exports = { punchUp };
