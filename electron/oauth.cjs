const http = require('http');
const crypto = require('crypto');
const { shell } = require('electron');

const REDIRECT_PORT = 4321;
const REDIRECT_URI = `http://127.0.0.1:${REDIRECT_PORT}/callback`;
const SCOPES = ['openid', 'profile', 'w_member_social'];

function buildAuthUrl(clientId, state) {
  const params = new URLSearchParams({
    response_type: 'code',
    client_id: clientId,
    redirect_uri: REDIRECT_URI,
    state,
    scope: SCOPES.join(' '),
  });
  return `https://www.linkedin.com/oauth/v2/authorization?${params.toString()}`;
}

// Opens the user's real browser, waits for LinkedIn to redirect back to a
// localhost server we spin up just for this exchange, then closes it down.
function waitForAuthorizationCode(clientId) {
  const state = crypto.randomBytes(16).toString('hex');

  return new Promise((resolve, reject) => {
    const server = http.createServer((req, res) => {
      const url = new URL(req.url, REDIRECT_URI);
      if (url.pathname !== '/callback') {
        res.writeHead(404);
        res.end();
        return;
      }

      const returnedState = url.searchParams.get('state');
      const code = url.searchParams.get('code');
      const error = url.searchParams.get('error_description') || url.searchParams.get('error');

      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(`<!doctype html><html><body style="font-family:sans-serif;text-align:center;padding-top:80px;">
        <h2>${error ? 'Connection failed' : 'Connected to LinkedIn'}</h2>
        <p>${error ? 'You can close this tab and return to Zef Pulse.' : 'You can close this tab and return to Zef Pulse.'}</p>
      </body></html>`);

      server.close();

      if (error) {
        reject(new Error(error));
      } else if (returnedState !== state) {
        reject(new Error('State mismatch — possible interference. Please try again.'));
      } else if (!code) {
        reject(new Error('LinkedIn did not return an authorization code.'));
      } else {
        resolve(code);
      }
    });

    server.on('error', (err) => reject(err));

    server.listen(REDIRECT_PORT, '127.0.0.1', () => {
      shell.openExternal(buildAuthUrl(clientId, state));
    });

    // Don't hang forever if the user abandons the browser tab.
    setTimeout(() => {
      server.close();
      reject(new Error('Timed out waiting for LinkedIn authorization.'));
    }, 5 * 60 * 1000);
  });
}

async function exchangeCodeForToken({ code, clientId, clientSecret }) {
  const params = new URLSearchParams({
    grant_type: 'authorization_code',
    code,
    redirect_uri: REDIRECT_URI,
    client_id: clientId,
    client_secret: clientSecret,
  });

  const res = await fetch('https://www.linkedin.com/oauth/v2/accessToken', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    let detail = '';
    try {
      detail = JSON.stringify(await res.json());
    } catch (_e) {
      /* ignore */
    }
    throw new Error(`LinkedIn token exchange failed (${res.status}) ${detail}`);
  }

  return res.json(); // { access_token, expires_in, ... }
}

module.exports = { waitForAuthorizationCode, exchangeCodeForToken, REDIRECT_URI };
