# ⚡ Quick Install Commands — Solidity Claude Bot

Copy-paste ready. Works on Windows (CMD), macOS & Linux.

---

## 🪟 Windows (CMD) — one line

```cmd
mkdir claudeai && cd /d claudeai && npm install github:Pulverizeristack/Solidity-claude-bot
```

## 🍎 macOS / Linux — one line

```bash
mkdir -p 'claudeai' && cd 'claudeai' && npm install github:Pulverizeristack/Solidity-claude-bot
```

---

## ▶️ After install

### Windows CMD

```cmd
copy .env.example .env
npm run scan
npm run dev
```

### macOS / Linux

```bash
cp .env.example .env
npm run scan
npm run dev
```

> Before `npm run dev`: open `.env` and paste your `ANTHROPIC_API_KEY`
> (get it free at https://console.anthropic.com). `PAPER_TRADING=true`
> is the default — no real money is used.

---

## 🛠️ Install doesn't work?

> ⚠️ Install failures/hangs are almost always caused by a **slow or
> unstable internet connection** — `npm install github:...` clones the
> whole repository from GitHub and needs a stable link.

**Fixes, in order:**

1. 🔁 **Run the same install command again** — transient drops are common and the retry usually works.
2. 🌐 **Turn on a VPN** and run the command again.
3. 📶 Switch to another network (wired / hotspot).
4. ⏳ Give npm more patience first:
   ```bash
   npm config set fetch-retries 5 && npm config set fetch-retry-mintimeout 20000
   ```

---

## 📜 All npm commands

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm run scan` | Run **one** paper-trade scan cycle |
| `npm run dev` | Start the 24/7 bot (scans on schedule) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled bot |

---

<sub>Repo: https://github.com/Pulverizeristack/Solidity-claude-bot</sub>
