# Rollback Plan & Backup Instructions

## Recent Git Commits

```
7acfebf Update homepage sports count from 6 to 13
42f89f6 Remove vendor-ml chunk from vite config (onnxruntime-web/@mediapipe_pose deleted)
07280e9 Remove video/ML dead code, fix 4 scoring bugs
84fc3fa temp
f16fa6d Fixed TypeScript type errors
```

## How to Rollback

### Quick Rollback (Last commit)
```bash
cd ~/tennis-journal
git revert HEAD --no-edit
```

### Rollback to Specific Commit
```bash
cd ~/tennis-journal
git revert <commit-hash> --no-edit
```

### Full Reset (Destructive - use only if needed)
```bash
cd ~/tennis-journal
git reset --hard <commit-hash>
```

## Backup Before This Security Audit

If you need to restore the pre-audit state:
```bash
cd ~/tennis-journal
# Create a backup branch
git checkout -b pre-security-audit-backup

# Or restore specific files
git checkout <commit-hash> -- src/ vite.config.ts index.html
```

## What Was Changed in This Audit

1. **Legal** - Added /legal/privacy-policy.html and /legal/terms-of-service.html with GDPR/CCPA compliant policies
2. **Security Headers** - Added X-Content-Type-Options, X-Frame-Options, Referrer-Policy, Permissions-Policy to vite.config.ts and CSP meta tag to index.html
3. **Secret Leaks** - Removed console.log statements that could leak sensitive data in production
4. **Secret Leaks** - Removed hardcoded API key from migration file (was: `eyJhbG...FkFg`)
5. **Gitignore** - Added explicit .env file exclusion
6. **Footer Links** - Updated to point to static HTML legal documents

## Restore Points

| Change | Files Modified | Commit Message |
|--------|---------------|----------------|
| Legal docs | legal/privacy-policy.html, legal/terms-of-service.html | Security audit: Legal compliance |
| Security headers | vite.config.ts, index.html | Security audit: Security headers |
| Console logs removed | Login.tsx, AddMatch.tsx, ScoreInput.tsx, etc. | Security audit: Remove debug logs |
| API key removed | supabase/migrations/20260523094907*.sql | Security audit: Remove leaked key |
| Gitignore updated | .gitignore | Security audit: Ensure .env excluded |

## Emergency Contacts

- **Supabase Console**: https://supabase.com/dashboard/project/pnlocibettgyqyttegcu
- **Production URL**: https://sportsjournal.app

## How to Verify Deployment

1. Check build succeeds: `npm run build`
2. Verify no console errors in browser DevTools
3. Test privacy policy loads at /legal/privacy-policy.html
4. Verify CSP headers with: `curl -I https://sportsjournal.app`