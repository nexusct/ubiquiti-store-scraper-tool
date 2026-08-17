# 🚨 SECURITY ALERT - IMMEDIATE ACTION REQUIRED

## Google API Key Exposure Detected

**Date:** August 17, 2026  
**Alert ID:** GitHub Secret Scanning Alert #1  
**Severity:** HIGH  
**Status:** EXPOSED IN GIT HISTORY

---

## Summary

A Google Maps API key was found exposed in the git history of this repository:

```
Key: AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk
Location: .pre-commit-config.yaml (now removed from current tree)
Commits: 8f6d7372a607d65f9123dcb9500d14167f182a9d (added)
         a8e9419d1409788bd2791f3bf1d72d409bb15f8c (removed)
```

**The key was embedded as a literal string in the pre-commit hook configuration** to prevent re-committing it. However, this approach inadvertently exposed the key in the repository history.

---

## Immediate Actions Required

### 1. Rotate the API Key ⚠️

**The exposed API key MUST be rotated immediately.** Even though it has been removed from the current tree, it remains in the git history and can be accessed by anyone who clones the repository.

**Steps to rotate:**

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Navigate to **APIs & Services > Credentials**
3. Locate the API key: `AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk`
4. **Delete or regenerate** the key
5. Create a new API key
6. Update all systems using the old key with the new key
7. Store the new key in a secure location (NOT in git)

### 2. Check for Unauthorized Usage

Review the API key usage logs in Google Cloud Console:

1. Go to **APIs & Services > Credentials**
2. Click on the exposed API key (if not yet deleted)
3. View the **Metrics** tab to check for:
   - Unexpected spike in API calls
   - API calls from unknown IP addresses or regions
   - API calls after the key was removed from the repository

### 3. Remove Key from Git History (Optional but Recommended)

The key has been removed from the current tree but still exists in git history. To completely remove it:

**Option A: Use BFG Repo-Cleaner (Recommended)**

```bash
# Install BFG
brew install bfg  # macOS
# or download from https://rtyley.github.io/bfg-repo-cleaner/

# Create a text file with the secret to remove
echo "AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk" > secrets.txt

# Clone a fresh copy of the repo
git clone --mirror https://github.com/nexusct/ubiquiti-store-scraper-tool.git
cd ubiquiti-store-scraper-tool.git

# Remove the secret from all history
bfg --replace-text secrets.txt

# Clean up and force push
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force
```

**Option B: Use git-filter-repo**

```bash
# Install git-filter-repo
pip install git-filter-repo

# Clone a fresh copy
git clone https://github.com/nexusct/ubiquiti-store-scraper-tool.git
cd ubiquiti-store-scraper-tool

# Create a file with replacement rules
echo "AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk==>REDACTED_GOOGLE_API_KEY" > replacements.txt

# Replace in all history
git filter-repo --replace-text replacements.txt --force

# Force push
git push origin --force --all
git push origin --force --tags
```

**⚠️ Warning:** Force pushing rewrites history. Coordinate with all team members before doing this on a shared repository.

---

## What Was Fixed in This PR

This pull request addresses the security alert by:

1. **Enhanced README.md**
   - Added comprehensive security section
   - Added usage guidelines and rate limiting ethics
   - Improved documentation structure and clarity
   - Added troubleshooting and contributing sections

2. **Updated SECURITY.md**
   - Comprehensive security policy with best practices
   - Detailed incident response history including this alert
   - Clear guidance on handling secrets properly
   - Instructions for removing secrets from git history

3. **Added LICENSE**
   - MIT License file for proper open source licensing

4. **Added config.example.js**
   - Example configuration file showing proper structure
   - Safe to commit (no secrets)

5. **Added .env.example**
   - Template for environment variables
   - Documents optional configuration via environment

6. **This NOTICE.md**
   - Documents the security alert
   - Provides immediate action items for the owner

---

## Prevention Measures Already in Place

The repository already has good security measures:

- ✅ `.gitignore` configured to block secrets
- ✅ Pre-commit hooks with `gitleaks` and `detect-secrets`
- ✅ Nexus-specific pattern blocks for known-bad strings
- ✅ `config.js` is gitignored (won't be committed)

## Recommendations Going Forward

1. **Never embed literal secret values** in pre-commit hooks or any committed file
   - Use **generic patterns** instead: `AIza[0-9A-Za-z_-]{35}` matches any Google API key
   - The literal key approach defeats the purpose and exposes the key

2. **Use environment variables or gitignored config files** for all secrets
   - ✅ `process.env.GOOGLE_API_KEY`
   - ✅ `import config from './config.js'` (gitignored)
   - ❌ `const key = 'AIzaSy...'` (hardcoded)

3. **Regular security audits**
   - Run `git log -p -S "AIza"` to search for exposed keys
   - Use `truffleHog` or `gitleaks` to scan the entire history periodically

4. **Enable GitHub secret scanning alerts**
   - Already enabled (this alert came from GitHub)
   - Ensure email notifications are enabled

---

## Timeline of Events

| Date | Event |
|------|-------|
| 2026-04-19 | Initial credential exposure incident (NCT-SEC-2026-04-19-001) |
| 2026-04-19 | Security hardening rollout: .gitignore, pre-commit hooks, SECURITY.md added |
| 2026-04-19 | **Google API key `AIzaSyAd72xUaF049-dbkwTAfSvsjQhmp9YLDpk` embedded in pre-commit config** |
| 2026-07-29 | Key removed from pre-commit config, but remains in git history |
| 2026-08-17 | GitHub Secret Scanning Alert #1 triggered |
| 2026-08-17 | **This PR created to address the alert and improve documentation** |

---

## Contact

For questions or concerns about this security alert:
- **Email:** office@nexusct.com
- **Repository:** https://github.com/nexusct/ubiquiti-store-scraper-tool

---

## Post-Remediation Checklist

- [ ] Google API key has been rotated in Google Cloud Console
- [ ] New API key stored securely (environment variable or gitignored config)
- [ ] Usage logs reviewed for unauthorized access
- [ ] (Optional) Key removed from git history using BFG or git-filter-repo
- [ ] All team members notified of the key rotation
- [ ] All systems using the old key updated with the new key
- [ ] This NOTICE.md file reviewed and understood

**Once all items are checked, this alert can be marked as resolved in GitHub.**
