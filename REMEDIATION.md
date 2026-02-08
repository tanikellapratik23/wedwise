# Secret Remediation & Safe Deploy Steps

Follow these steps to revoke the exposed Groq key, purge it from history, and redeploy without embedding secrets.

1) Revoke the exposed API key (do this first)
   - Log into your Groq/API provider console and immediately revoke the compromised key.

2) Create a new key and store it securely
   - Create a fresh key in the provider console.
   - Add the new key to GitHub Actions as a repository secret named `GROQ_API_KEY` (see step 6).

3) Remove local/tracked secrets
   - Ensure `.gitignore` includes `/server/.env` and `/client/.env`.
   - Remove any .env from the working tree: `git rm --cached server/.env || true`

4) Purge the secret from Git history (irreversible; make a backup)
   - Recommended: use `git filter-repo` (fast & reliable). Install: `pip install git-filter-repo`.
   - Example (replace YOUR_SECRET):
     ```bash
     # Make a mirror backup first
     git clone --mirror git@github.com:YOUR_ORG/YOUR_REPO.git repo-mirror.git

     # In your repo (clean working copy), run:
     git filter-repo --invert-paths --paths server/.env

     # Or to remove the string from history:
     git filter-repo --replace-text <(printf "password==>***REDACTED***\nYOUR_SECRET==>***REDACTED***")
     ```
   - Alternative: BFG Repo Cleaner (simpler for strings). See https://rtyley.github.io/bfg-repo-cleaner/.

5) Clean `gh-pages` branch (if built assets contained the key)
   - Rebuild client locally after removing any client-side GROQ env usage.
   - Create an orphan branch from the clean `client/dist` output and force-push:
     ```bash
     # from repo root
     git checkout --orphan gh-pages
     git rm -rf .
     cp -r client/dist/* .
     git add -A
     git commit -m "Deploy cleaned site"
     git push --force origin gh-pages
     ```
   - If GitHub blocks pushes due to detected secrets, ensure the secret is purged from history and that the built files don't include it.

6) Add new Groq key to GitHub Actions secrets
   - Using GH web UI: Settings → Secrets and variables → Actions → New repository secret `GROQ_API_KEY`.
   - Or GH CLI:
     ```bash
     gh secret set GROQ_API_KEY --body "$GROQ_API_KEY"
     ```

7) Update CI to use server-side secret only
   - Ensure client build does NOT receive the key as `VITE_` env var.
   - The server job should read `GROQ_API_KEY` and use it at runtime or during server build only.

8) Rebuild & verify
   - Run local build: `cd client && npm run build`
   - Inspect `client/dist/assets` for accidental secret strings: `grep -R "gsk_\|YOUR_SECRET_FRAGMENT" client/dist || true`
   - Push cleaned `gh-pages` or re-run GitHub Actions deploy.

9) Verify remote
   - Clone the `gh-pages` branch to a temp dir and search for the secret fragment.
     ```bash
     git clone --branch gh-pages --single-branch git@github.com:YOUR_ORG/YOUR_REPO.git /tmp/ghpages.clean
     grep -R "YOUR_SECRET_FRAGMENT" /tmp/ghpages.clean || echo "KEY_NOT_FOUND"
     ```

10) Post-remediation
   - Rotate any other credentials that may have been exposed.
   - Notify stakeholders and rotate keys in provider consoles.

If you want, I can run some of these repo edits and add a small script to help inspect built assets for common key prefixes.
