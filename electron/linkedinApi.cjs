// Ported from the working Python fix: LinkedIn's Posts API uses a "little text"
// format where (){}[]<>@|*_~# and backslash must be backslash-escaped, or the
// post silently truncates at the first unescaped special character.
// Hashtags are the one exception: they must be sent as {hashtag|#|Word}, not escaped.

const LITTLE_TEXT_SPECIALS = new Set(['\\', '(', ')', '[', ']', '{', '}', '<', '>', '@', '|', '*', '_', '~', '#']);

function escapeLittleText(text) {
  let out = '';
  for (const ch of text) {
    if (LITTLE_TEXT_SPECIALS.has(ch)) out += '\\' + ch;
    else out += ch;
  }
  return out;
}

function prepareCommentary(rawText) {
  const hashtags = [];
  // Stash hashtags behind a placeholder so the generic escaper doesn't touch them.
  const withPlaceholders = rawText.replace(/#(\w+)/g, (_match, word) => {
    hashtags.push(word);
    return `\u0000${hashtags.length - 1}\u0000`;
  });

  const escaped = escapeLittleText(withPlaceholders);

  return escaped.replace(/\u0000(\d+)\u0000/g, (_match, idx) => `{hashtag|\\#|${hashtags[Number(idx)]}}`);
}

// LinkedIn requires a LinkedIn-Version header in YYYYMM format, and only keeps
// roughly the trailing 12 months active. Compute a recent one dynamically
// instead of hardcoding a date that will eventually go stale and start
// failing with a NONEXISTENT_VERSION error. Two months back is a safe bet
// since the newest month isn't always live yet.
function getLinkedInVersion() {
  const d = new Date();
  d.setMonth(d.getMonth() - 2);
  return `${d.getFullYear()}${String(d.getMonth() + 1).padStart(2, '0')}`;
}

async function fetchUserInfo(accessToken) {
  const res = await fetch('https://api.linkedin.com/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error(`Could not fetch LinkedIn profile (${res.status})`);
  }
  const data = await res.json();
  return {
    sub: data.sub,
    name: data.name,
    picture: data.picture,
    urn: `urn:li:person:${data.sub}`,
  };
}

async function publishPost({ accessToken, personUrn, text, image }) {
  const commentary = text?.trim() ? prepareCommentary(text) : '';
  let imageUrn;

  if (image?.data) {
    imageUrn = await uploadImage({
      accessToken,
      ownerUrn: personUrn,
      imageBuffer: Buffer.from(image.data, 'base64'),
      mimeType: image.mimeType,
    });
  }

  const body = {
    author: personUrn,
    visibility: 'PUBLIC',
    distribution: {
      feedDistribution: 'MAIN_FEED',
      targetEntities: [],
      thirdPartyDistributionChannels: [],
    },
    lifecycleState: 'PUBLISHED',
    isReshareDisabledByAuthor: false,
  };

  if (commentary) body.commentary = commentary;
  if (imageUrn) {
    body.content = {
      media: {
        id: imageUrn,
      },
    };
  }

  const res = await fetch('https://api.linkedin.com/rest/posts', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': getLinkedInVersion(),
    },
    body: JSON.stringify(body),
  });

  if (res.status !== 201) {
    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch (_e) {
      /* ignore */
    }
    throw new Error(`LinkedIn rejected the post (${res.status}) ${detail}`);
  }

  const postId = res.headers.get('x-restli-id') || res.headers.get('x-linkedin-id') || null;
  return { postId };
}

async function uploadImage({ accessToken, ownerUrn, imageBuffer, mimeType }) {
  const initRes = await fetch('https://api.linkedin.com/rest/images?action=initializeUpload', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${accessToken}`,
      'Content-Type': 'application/json',
      'X-Restli-Protocol-Version': '2.0.0',
      'LinkedIn-Version': getLinkedInVersion(),
    },
    body: JSON.stringify({
      initializeUploadRequest: {
        owner: ownerUrn,
      },
    }),
  });

  if (!initRes.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await initRes.json());
    } catch (_e) {
      /* ignore */
    }
    throw new Error(`Could not start image upload (${initRes.status}) ${detail}`);
  }

  const initData = await initRes.json();
  const uploadUrl = initData?.value?.uploadUrl;
  const imageUrn = initData?.value?.image;
  if (!uploadUrl || !imageUrn) {
    throw new Error('LinkedIn did not return image upload details.');
  }

  const uploadRes = await fetch(uploadUrl, {
    method: 'PUT',
    headers: {
      'Content-Type': mimeType || 'application/octet-stream',
    },
    body: imageBuffer,
  });

  if (!uploadRes.ok) {
    throw new Error(`Image upload failed (${uploadRes.status}).`);
  }

  return imageUrn;
}

module.exports = { escapeLittleText, prepareCommentary, fetchUserInfo, publishPost, uploadImage };
