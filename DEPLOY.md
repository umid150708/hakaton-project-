# BiznesPlan AI — Deployment Guide

## Local Development (Current Setup)

```bash
# Install
npm install

# Frontend (Terminal 1)
npm run dev
# Opens http://localhost:5174

# Backend API (Terminal 2 — requires API key)
npm run api
# Runs on http://localhost:3001

# Or use demo mode (no API needed)
http://localhost:5174/?demo=1
```

---

## Deploy to Vercel (Recommended for Hackathons)

### Why Vercel?
- Free tier covers most hackathon use
- Automatic HTTPS
- Environment variables auto-managed
- API routes work out of the box
- Custom domain support

### Steps

1. **Push to GitHub:**
   ```bash
   git init
   git add .
   git commit -m "BiznesPlan AI initial commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_USERNAME/biznesplan-ai.git
   git push -u origin main
   ```

2. **Import to Vercel:**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project" → Import GitHub repo
   - Select `biznesplan-ai`
   - Click "Deploy"

3. **Add Environment Variable:**
   - After deploy, go to Project → Settings → Environment Variables
   - Add: `ANTHROPIC_API_KEY=sk-ant-...`
   - Redeploy

4. **Test:**
   ```
   https://your-project.vercel.app/?demo=1
   ```

---

## Deploy to Netlify (Alternative)

Netlify can host the frontend, but API routes are trickier. Recommend Vercel instead.

---

## Deploy Custom Domain

### With Vercel:
1. Project Settings → Domains
2. Add your domain (e.g., `biznesplan.uz`)
3. Update DNS records per Vercel's instructions
4. Ready in ~5 minutes

---

## Production Checklist

- [ ] Remove `.env.local` from git (add to `.gitignore`)
- [ ] API key stored in Vercel environment variables (never in code)
- [ ] Demo mode works (`?demo=1`)
- [ ] PDF export tested
- [ ] Mobile responsive tested
- [ ] All text in Uzbek
- [ ] Business plan content is realistic
- [ ] Scoring breakdowns are clear

---

## After Hackathon

### If You Win / Get Funding:
1. **Set up CI/CD:**
   - GitHub Actions for automated testing
   - Auto-deploy on push to main

2. **Add monitoring:**
   - Sentry for error tracking
   - Vercel Analytics for performance

3. **Scale API calls:**
   - Implement request caching
   - Add rate limiting
   - Monitor token usage

4. **Improve UX:**
   - Add progress indicators
   - Mobile-first design
   - Accessibility (a11y) audit

5. **Feature backlog:**
   - Export to Word (.docx) in addition to PDF
   - Multi-language support (Russian, English)
   - Integration with government AI credit scoring (Dec 2026)
   - Email results to entrepreneur

---

## Cost Estimates

| Service | Free Tier | Notes |
|---------|---|---|
| Vercel | 100 deployments/month | More than enough |
| Anthropic API | $0.30 per 1M input tokens | ~$0.15 per interview |
| Domain | $12/year | `.uz` domains ~$10 |
| **Total Monthly** | ~$20 | For 100+ real interviews |

---

## Troubleshooting Deployment

**"API key not found"**
- Vercel → Settings → Environment Variables
- Verify `ANTHROPIC_API_KEY` is set
- Redeploy

**"CORS error"**
- Already handled in `api/generate.ts` (Access-Control-Allow-Origin: *)
- Check browser console for actual error

**"Build fails"**
```bash
npm run build  # Test locally first
npm run typecheck  # Check TypeScript
```

**"PDF export broken"**
- jsPDF may need fonts for Uzbek characters
- See `src/lib/pdfExport.ts` for Unicode font setup

---

## Monitoring Live Site

### Vercel Dashboard:
- Real-time deployment status
- Build logs
- Environment variable audit trail
- Custom domains + SSL status

### Best Practices:
1. Keep a backup demo URL (test with `?demo=1` always works)
2. Monitor API costs weekly
3. Add error alerts to Slack/Discord
4. Test on real devices before pitching to judges
