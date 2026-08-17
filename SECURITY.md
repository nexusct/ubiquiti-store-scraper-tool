# Security Policy

This repository is maintained by **Nexus Communications Technology** (Nexuscomm LLC).

## Reporting a Security Vulnerability

If you discover a security vulnerability, **do NOT** open a public issue or pull request.

Instead, please email **office@nexusct.com** with:
- A description of the vulnerability and its potential impact
- Steps to reproduce (if applicable)
- The commit hash, branch, or tag where you observed it
- Any suggested fixes or mitigations (optional)

We will acknowledge your report within 2 business days and provide a more detailed response within 7 days indicating the next steps in handling your report.

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 1.x     | :white_check_mark: |
| < 1.0   | :x:                |

## Security Best Practices

### What Should Never Be Committed

**Never commit any of the following to this repository:**

- **Credentials & Secrets**
  - Passwords, API keys, tokens, access keys
  - Private keys, certificates, keystores
  - Service account credentials (e.g., `gcp-key.json`, AWS credentials)
  - OAuth tokens, session tokens, JWT secrets

- **Sensitive Business Data**
  - Internal pricing data, dealer costs, margin percentages
  - Customer PII (Personally Identifiable Information) or PHI (Protected Health Information)
  - Internal network addresses, hostnames, or IP addresses
  - Database connection strings with embedded credentials

- **Data Files**
  - Database dumps or backups containing real data
  - Production logs containing sensitive information
  - Binary files containing secrets or credentials

### How to Handle Secrets Properly

**Use environment variables or runtime configuration:**

```javascript
// ❌ BAD - Hardcoded secret
const apiKey = 'AIzaSyAXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX';

// ✅ GOOD - Environment variable
const apiKey = process.env.GOOGLE_API_KEY;

// ✅ GOOD - Runtime config file (gitignored)
import config from './config.local.js';
const apiKey = config.googleApiKey;
```

**Create example configuration files:**

```javascript
// config.example.js - Committed to repository
export default {
  googleApiKey: 'YOUR_API_KEY_HERE',
  apiEndpoint: 'https://api.example.com'
};

// config.js - Gitignored, contains real secrets
export default {
  googleApiKey: 'your_actual_api_key_goes_here',
  apiEndpoint: 'https://api.example.com'
};
```

## Pre-commit Security Hooks

This repository uses [pre-commit](https://pre-commit.com/) hooks to prevent accidental secret commits:

- **gitleaks** — Detects committed secrets using pattern matching
- **detect-secrets** — Second-layer secret scanner
- **Nexus-specific patterns** — Blocks known-bad strings from past incidents

### Setup (One-Time Per Clone)

```bash
# Install pre-commit (requires Python)
pip install pre-commit

# Install the git hook scripts
pre-commit install

# (Optional) Run against all files to test
pre-commit run --all-files
```

Once installed, hooks will run automatically on every `git commit`. If a secret is detected, the commit will be blocked.

### Bypassing Pre-commit Hooks (Not Recommended)

In exceptional cases where you need to bypass the hooks:

```bash
git commit --no-verify -m "your message"
```

**Warning:** Only use `--no-verify` if you are absolutely certain your commit does not contain secrets.

## Incident Response History

### 2026-07-29 — Secret Scanning Alert #1 (Google API Key)
- **Status:** Resolved
- **Issue:** Google Maps API key (`AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk`) was embedded in `.pre-commit-config.yaml` as a literal grep pattern
- **Impact:** API key exposed in public repository git history
- **Resolution:** Key removed from pre-commit config in commit `a8e9419d`. Owner notified to rotate the key.
- **Prevention:** Pre-commit hooks now use generic pattern matching instead of literal key values

### 2026-04-19 — Credential Exposure Incident (NCT-SEC-2026-04-19-001)
- **Status:** Resolved
- **Issue:** Multiple credentials exposed (Google Maps API key, admin password)
- **Impact:** Credentials committed to repository
- **Resolution:** All credentials rotated. Security baseline deployed across all repositories.
- **Prevention:** Added comprehensive `.gitignore`, pre-commit hooks, and this security policy

## If You've Committed a Secret

If you accidentally commit a secret:

1. **DO NOT** just delete it in a new commit — it will still exist in git history
2. **Rotate the secret immediately** — assume it has been compromised
3. **Contact the security team** at office@nexusct.com
4. **Remove it from git history** using one of these methods:

   ```bash
   # Option 1: BFG Repo-Cleaner (recommended for large histories)
   bfg --replace-text passwords.txt

   # Option 2: git filter-branch (for specific files)
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch path/to/file" \
     --prune-empty --tag-name-filter cat -- --all

   # Option 3: git filter-repo (modern alternative)
   git filter-repo --path path/to/file --invert-paths
   ```

5. **Force push to all remotes** (coordinate with team first):
   ```bash
   git push origin --force --all
   git push origin --force --tags
   ```

## Security Scanning

This repository is monitored by:
- **GitHub Secret Scanning** — Detects committed secrets automatically
- **Dependabot Security Alerts** — Notifies of vulnerable dependencies
- **Pre-commit Hooks** — Prevents secrets from being committed in the first place

## Additional Resources

- [GitHub Secret Scanning Documentation](https://docs.github.com/en/code-security/secret-scanning/about-secret-scanning)
- [OWASP Secrets Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Secrets_Management_Cheat_Sheet.html)
- [Pre-commit Framework](https://pre-commit.com/)
- [How to Remove Sensitive Data from a Git Repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository)

## Questions?

For questions about this security policy, contact **office@nexusct.com**.
