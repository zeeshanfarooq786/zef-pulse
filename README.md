<p align="center">
   <img width="400" height="195" alt="Image" src="https://github.com/user-attachments/assets/bbdb29ea-ed62-410b-ac8f-b404671560d6" />
</p>
<h1 align="center">Zef Pulse</h1>
<p align="center"><em>by Zef Technology</em></p>
 
Zef Pulse a LinkedIn posting desktop app

A small Electron + React app: write a post, see a live LinkedIn-style preview,
click Publish. Built to fix the exact truncation bug you hit in Cursor
(unescaped `(`, `#`, `*`, etc. in LinkedIn's "little text" format).

## Changelog: recent fixes

- **Blank white screen in the installed app** — caused by the Content-Security-Policy
  blocking script execution under `file://`. Fixed in `index.html`.
- **Broken profile picture in the preview** — same CSP was blocking the external
  LinkedIn image URL; also added a fallback to the initials avatar if the image
  fails to load (`src/components/PostPreview.jsx`).
- **Publish failing with `NONEXISTENT_VERSION` (426)** — the LinkedIn API version
  header was hardcoded to May 2024, which aged out of LinkedIn's active window.
  Now computed dynamically in `electron/linkedinApi.cjs`.
- **No right-click copy/paste** — added a minimal native context menu in
  `electron/main.cjs` using only built-in Electron APIs. (Earlier we tried the
  `electron-context-menu` package combined with `bytenode` bytecode compilation —
  that combination crashes with `ERR_REQUIRE_ESM` because the package is
  ESM-only. Both are intentionally avoided now in favor of the approach below.)
- **Code protection** — `electron/*.cjs` are obfuscated into `electron-prod/`
  as part of `npm run dist` (see `scripts/obfuscate.cjs`), which is what
  actually ships in the installer; your readable source in `electron/` never
  does. DevTools access is disabled outside development mode. This raises the
  bar significantly but, like any shipped desktop software, isn't literally
  unbreakable against a determined reverse-engineer.
- **Logo and color scheme** — replaced with the real Zef Pulse logo
  (`build/icon.ico`, `build/icon.png`, `public/logo.png`), and the UI's accent
  color changed from amber to a LinkedIn-style blue (`tailwind.config.js`'s
  `brand` tokens) to match.

## Run it locally (development)

You'll need Node.js 18+ installed. This must be run on your own machine —
the sandbox this was built in has no internet access to download the Electron
binary itself.

```bash
cd zef-pulse-app
npm install
npm run electron:dev
```

This opens the app with hot reload. First run: go to Settings, follow the
3 steps to create a free LinkedIn Developer app, paste in your Client ID/Secret,
click Connect.

## Build a real Windows .exe installer

```bash
npm run dist
```

This produces an installer in `release/` (e.g. `Zef Pulse Setup 1.0.0.exe`) that
you or anyone else can double-click to install, with a desktop shortcut.

Before shipping to real customers, replace the placeholder icons —
add `build/icon.ico` (Windows) and `build/icon.icns` (Mac) — otherwise
electron-builder will use a default Electron icon.

## Why "bring your own LinkedIn app" instead of one shared login?

LinkedIn's posting API needs a Client ID *and* Client Secret. If Zef Pulse
shipped one shared secret inside the .exe for every customer, anyone could
extract it from the binary — a real security problem, and LinkedIn can revoke
a leaked app. Asking each customer to create their own free LinkedIn app
(2 minutes, instant approval for basic posting) avoids that entirely, at the
cost of one extra setup step. See `src/components/Settings.jsx` for the
in-app instructions customers see.

If you later want a true "just click Connect, no setup" experience for
customers, the next step is a small backend (e.g. a Cloudflare Worker or
Vercel function) that holds one shared Client Secret and only ever receives
the authorization code from the desktop app, then returns a token. Nobody
extracts a secret from the app anymore because the app never has it. That's a
bigger project than this MVP — happy to help build that next if you want it.

## Put this on GitHub

```bash
cd linkedin-poster-app
git init
git add .
git commit -m "Initial commit"
```

Then on github.com: click **New repository**, name it (e.g. `zef-pulse`), leave it
empty (no README/license — you already have files), and copy the commands
it shows you, which will look like:

```bash
git remote add origin https://github.com/YOUR_USERNAME/zef-pulse.git
git branch -M main
git push -u origin main
```

From then on, any time you (or Cursor) change code:

```bash
git add .
git commit -m "describe what changed"
git push
```

## Shipping updates to people who already installed the app

This only matters once you have real customers with the app installed —
skip it for now if you're still building.

1. In `package.json`, under `"build": { "publish": ... }`, replace
   `YOUR_GITHUB_USERNAME` and `YOUR_REPO_NAME` with your actual GitHub
   username and repo name.
2. When you're ready to ship an update: bump `"version"` in `package.json`
   (e.g. `1.0.0` → `1.0.1`), commit, then create a version tag and push it:
   ```bash
   git tag v1.0.1
   git push --tags
   ```
3. That tag triggers `.github/workflows/release.yml`, which builds the
   Windows installer on GitHub's servers and publishes it as a GitHub
   Release automatically — you don't have to build it on your own machine.
4. Everyone who already has the app installed will get it automatically:
   `electron-updater` (already wired up in `electron/main.cjs`) checks your
   GitHub Releases on every launch and installs the new version in the
   background.

The very first release needs to be installed manually by each user (there's
nothing to auto-update *from* yet) — every release after that updates itself.

## The download link for your website

Because the installer filename is fixed (`ZefPulseSetup.exe`, set in
`package.json` under `build.win.artifactName`), this URL always points to
whatever your newest release is, forever — put this exact link on your
website and never touch it again:

```
https://github.com/zeeshanfarooq786/zef-pulse/releases/latest/download/ZefPulseSetup.exe
```

## AI polish (optional)

There's a "Punch it up" button on the Create Post screen that rewrites your
draft with more personality/emoji before you publish, using the Anthropic
API. It needs its own API key (get one at
https://console.anthropic.com/settings/keys), entered once in Settings —
same bring-your-own-credential pattern as LinkedIn, so no key of yours ships
inside the app. It's entirely optional; the app works without it.

## Project structure

```
electron/
  main.cjs        window creation + IPC handlers
  preload.cjs      safe bridge exposed to the renderer as window.zef-pulse
  oauth.cjs        opens LinkedIn login in the system browser, catches the
                   redirect on a local server, exchanges code for a token
  linkedinApi.cjs  the escaping fix (prepareCommentary) + the publish call
  store.cjs        encrypts the token at rest using the OS keychain
                   (Electron's safeStorage), not plaintext
src/
  App.jsx                    app shell / routing between views
  components/CreatePost.jsx  the writing screen
  components/PostPreview.jsx the live LinkedIn-style preview card
  components/Settings.jsx    LinkedIn app connect/disconnect flow
  components/Sidebar.jsx     left nav
  components/TitleBar.jsx    custom frameless window title bar
```

## What's not built yet (roadmap ideas)

- **Post history** — a log of what you've published, with timestamps
- **Scheduling** — queue a post for a future time (needs a background
  scheduler process, since the app must be running to fire the post)
- **Images/media** — LinkedIn's API supports image uploads; not wired up yet
- **Licensing/payments** — if you sell this, look at Keygen.sh, Gumroad
  licensing, or a Stripe Checkout + generated license key checked on launch
- **Auto-update** — `electron-updater` + GitHub Releases is the usual path

## A note on LinkedIn's terms

LinkedIn allows posting via its official API using a member's own OAuth
token (this is exactly what Buffer, Hootsuite, etc. do) — that's what this
app does. It does not scrape LinkedIn or automate a logged-in browser
session, which is the kind of automation LinkedIn's terms do prohibit.
Keep it that way if you extend this.
