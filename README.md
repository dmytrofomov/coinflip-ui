# TON Coin Flip — UI

Frontend for the provably-fair PvP heads-or-tails game on TON: connect a wallet,
create a game, join, reveal, and verify fairness. Static React + Vite + TON
Connect app that talks directly to the deployed contracts.

> Contracts, tests, and the lobby indexer live in the main project repo. This
> repo is the deployable UI only. The wrappers in `wrappers-ts/` are generated
> from the contracts — re-copy them if the contract ABI changes.

## Local dev

```bash
npm ci
cp .env.example .env   # optional; testnet factory is preset
npm run dev            # http://localhost:5173  (add ?testnet=true for testnet)
```

Other scripts: `npm run build` · `npm run preview` · `npm run lint` · `npm run typecheck` · `npm run fmt`.

## Deploy to GitHub Pages (automatic)

This repo ships a workflow at `.github/workflows/deploy.yml` that builds and
publishes on every push to `main`.

1. Create a **public** repo and push:
   ```bash
   gh repo create coinflip-ui --public --source=. --remote=origin --push
   # or: create it on github.com, then
   # git remote add origin git@github.com:<you>/coinflip-ui.git && git push -u origin main
   ```
2. On GitHub: **Settings → Pages → Build and deployment → Source: GitHub Actions**.
3. Done — the workflow builds and deploys. Site goes live at
   `https://<you>.github.io/<repo>/`.

The workflow automatically:

- sets Vite's `base` to the repo subpath (so assets + routing resolve);
- generates `tonconnect-manifest.json` pointing at the live URL;
- bakes in the testnet `VITE_FACTORY_ADDRESS_TESTNET`.

### Configuration

Edit the `env:` block in `.github/workflows/deploy.yml`:

| Var                            | Purpose                                                       |
| ------------------------------ | ------------------------------------------------------------- |
| `VITE_FACTORY_ADDRESS_TESTNET` | factory the app talks to (preset to the deployed testnet one) |
| `VITE_INDEXER_URL`             | hosted lobby indexer; empty → the "Лобі" tab disables itself  |

For mainnet, set `VITE_FACTORY_ADDRESS_MAINNET` and make mainnet the default network.

## Notes

- **Root-domain hosts are simpler.** On a custom domain or a `<user>.github.io`
  user-site (served at root), no subpath handling is needed. Cloudflare Pages /
  Vercel / Netlify also work and can deploy from a private repo.
- **TON Connect icon:** the manifest uses `app-icon.svg`; some wallets prefer a
  180×180 PNG — swap it in `app/public/` if needed.
- The deployed site is always public; that is expected for a dApp.
